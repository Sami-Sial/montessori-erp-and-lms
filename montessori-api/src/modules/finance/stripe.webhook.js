/**
 * Stripe Webhook Handler
 * Processes checkout.session.completed events to mark invoices as PAID.
 */
import Stripe from 'stripe';
import prisma from '../../config/db.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2024-06-20',
});

export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event;

  try {
    if (endpointSecret && sig) {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } else {
      // In dev/test mode without webhook secret, parse raw body
      event = JSON.parse(req.body.toString());
    }
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err.message);
    return res.status(400).json({ error: 'Webhook signature verification failed' });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const invoiceId = session.metadata?.invoiceId;
    const organizationId = session.metadata?.organizationId;

    if (invoiceId && organizationId) {
      try {
        const invoice = await prisma.invoice.findFirst({
          where: { id: invoiceId, organizationId },
        });

        if (invoice && invoice.status !== 'PAID') {
          const amountPaid = session.amount_total / 100; // cents to dollars

          await prisma.$transaction(async (tx) => {
            // Record payment
            await tx.payment.create({
              data: {
                organizationId,
                invoiceId,
                amount: amountPaid,
                currency: invoice.currency ?? 'USD',
                referenceNumber: session.payment_intent,
                status: 'COMPLETED',
                paidAt: new Date(),
              },
            });

            // Update invoice paid amount and status
            const newPaidAmount = Number(invoice.paidAmount) + amountPaid;
            const newStatus = newPaidAmount >= Number(invoice.totalAmount) ? 'PAID' : 'PARTIALLY_PAID';

            await tx.invoice.update({
              where: { id: invoiceId },
              data: {
                paidAmount: newPaidAmount,
                status: newStatus,
              },
            });

            // Write ledger credit entry
            const lastLedger = await tx.ledger.findFirst({
              where: { organizationId },
              orderBy: { createdAt: 'desc' },
              select: { runningBalance: true },
            });

            await tx.ledger.create({
              data: {
                organizationId,
                type: 'CREDIT',
                description: `Stripe payment for invoice ${invoice.invoiceNumber}`,
                amount: amountPaid,
                currency: invoice.currency ?? 'USD',
                runningBalance: (Number(lastLedger?.runningBalance) || 0) + amountPaid,
                referenceId: invoiceId,
                referenceType: 'Payment',
              },
            });
          });


          console.log(`✅ Stripe payment processed for invoice ${invoiceId} — $${amountPaid}`);
        }
      } catch (err) {
        console.error('Error processing Stripe webhook for invoice:', err);
        return res.status(500).json({ error: 'Internal error processing payment' });
      }
    }
  }

  res.json({ received: true });
};
