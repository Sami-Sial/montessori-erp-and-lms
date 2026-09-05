--
-- PostgreSQL database dump
--

\restrict 0sJz6Q2kPhPASpZIVsJVgWlcT2Ibf7znhCfySWPqOKhqErbk7rNNIBSZPedOl6r

-- Dumped from database version 18.0
-- Dumped by pg_dump version 18.0

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: Organization; Type: TABLE DATA; Schema: public; Owner: postgres
--

SET SESSION AUTHORIZATION DEFAULT;

ALTER TABLE public."Organization" DISABLE TRIGGER ALL;

INSERT INTO public."Organization" (id, name, slug, "logoUrl", website, phone, email, address, city, country, timezone, locale, "isActive", "trialEndsAt", "createdAt", "updatedAt", "deletedAt") VALUES ('cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', 'Sunrise Montessori Academy', 'sunrise-montessori', NULL, NULL, '+1-555-0100', 'admin@sunrise.edu', '123 Elm Street', 'Austin', 'US', 'America/Chicago', 'en', true, NULL, '2026-09-03 15:18:11.944', '2026-09-03 15:18:11.944', NULL);


ALTER TABLE public."Organization" ENABLE TRIGGER ALL;

--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public."User" DISABLE TRIGGER ALL;

INSERT INTO public."User" (id, "organizationId", email, "passwordHash", "firstName", "lastName", "avatarUrl", phone, "isEmailVerified", "emailVerifyToken", "resetToken", "resetTokenExpiry", "isActive", "lastLoginAt", locale, "createdAt", "updatedAt", "deletedAt") VALUES ('199eb894-54cd-453f-9418-6cc70d83f1c6', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', 'parent2@example.com', '$argon2id$v=19$m=65536,t=3,p=4$xjeGm1PdNV5ue2IVM3szqg$qQe2FG8rDa+xQ/lbAj3l9W8txcXsfwkKO17YhFMnipQ', 'Emily', 'Johnson', NULL, NULL, true, NULL, NULL, NULL, true, NULL, 'en', '2026-09-03 15:18:14.627', '2026-09-03 15:18:14.627', NULL);
INSERT INTO public."User" (id, "organizationId", email, "passwordHash", "firstName", "lastName", "avatarUrl", phone, "isEmailVerified", "emailVerifyToken", "resetToken", "resetTokenExpiry", "isActive", "lastLoginAt", locale, "createdAt", "updatedAt", "deletedAt") VALUES ('dc75a027-8b85-46c1-9621-c7d765a819e5', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', 'parent3@example.com', '$argon2id$v=19$m=65536,t=3,p=4$xjeGm1PdNV5ue2IVM3szqg$qQe2FG8rDa+xQ/lbAj3l9W8txcXsfwkKO17YhFMnipQ', 'Carlos', 'Rivera', NULL, NULL, true, NULL, NULL, NULL, true, NULL, 'en', '2026-09-03 15:18:14.642', '2026-09-03 15:18:14.642', NULL);
INSERT INTO public."User" (id, "organizationId", email, "passwordHash", "firstName", "lastName", "avatarUrl", phone, "isEmailVerified", "emailVerifyToken", "resetToken", "resetTokenExpiry", "isActive", "lastLoginAt", locale, "createdAt", "updatedAt", "deletedAt") VALUES ('74f06c0a-b838-4549-8b86-6a6d386ff69f', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', 'teacher@sunrise.edu', '$argon2id$v=19$m=65536,t=3,p=4$xjeGm1PdNV5ue2IVM3szqg$qQe2FG8rDa+xQ/lbAj3l9W8txcXsfwkKO17YhFMnipQ', 'Sarah', 'Kowalski', NULL, NULL, true, NULL, NULL, NULL, true, '2026-09-04 04:24:05.455', 'en', '2026-09-03 15:18:14.535', '2026-09-04 04:24:05.457', NULL);
INSERT INTO public."User" (id, "organizationId", email, "passwordHash", "firstName", "lastName", "avatarUrl", phone, "isEmailVerified", "emailVerifyToken", "resetToken", "resetTokenExpiry", "isActive", "lastLoginAt", locale, "createdAt", "updatedAt", "deletedAt") VALUES ('3fcda805-31ba-4596-af43-a3d57babf0d8', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', 'hr@sunrise.edu', '$argon2id$v=19$m=65536,t=3,p=4$xjeGm1PdNV5ue2IVM3szqg$qQe2FG8rDa+xQ/lbAj3l9W8txcXsfwkKO17YhFMnipQ', 'James', 'OBrien', NULL, NULL, true, NULL, NULL, NULL, true, '2026-09-04 04:48:33.802', 'en', '2026-09-03 15:18:14.571', '2026-09-04 04:48:33.804', NULL);
INSERT INTO public."User" (id, "organizationId", email, "passwordHash", "firstName", "lastName", "avatarUrl", phone, "isEmailVerified", "emailVerifyToken", "resetToken", "resetTokenExpiry", "isActive", "lastLoginAt", locale, "createdAt", "updatedAt", "deletedAt") VALUES ('dc3fa849-2543-4d90-991b-fd3acacadde4', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', 'frontdesk@sunrise.edu', '$argon2id$v=19$m=65536,t=3,p=4$xjeGm1PdNV5ue2IVM3szqg$qQe2FG8rDa+xQ/lbAj3l9W8txcXsfwkKO17YhFMnipQ', 'Lily', 'Zhang', NULL, NULL, true, NULL, NULL, NULL, true, '2026-09-04 04:52:01.75', 'en', '2026-09-03 15:18:14.592', '2026-09-04 04:52:01.752', NULL);
INSERT INTO public."User" (id, "organizationId", email, "passwordHash", "firstName", "lastName", "avatarUrl", phone, "isEmailVerified", "emailVerifyToken", "resetToken", "resetTokenExpiry", "isActive", "lastLoginAt", locale, "createdAt", "updatedAt", "deletedAt") VALUES ('304d564b-7ce6-4ef3-b27c-2b7709881448', NULL, 'superadmin@platform.com', '$argon2id$v=19$m=65536,t=3,p=4$xjeGm1PdNV5ue2IVM3szqg$qQe2FG8rDa+xQ/lbAj3l9W8txcXsfwkKO17YhFMnipQ', 'Platform', 'Admin', NULL, NULL, true, NULL, NULL, NULL, true, '2026-09-04 13:20:36.549', 'en', '2026-09-03 15:18:14.468', '2026-09-04 13:20:36.552', NULL);
INSERT INTO public."User" (id, "organizationId", email, "passwordHash", "firstName", "lastName", "avatarUrl", phone, "isEmailVerified", "emailVerifyToken", "resetToken", "resetTokenExpiry", "isActive", "lastLoginAt", locale, "createdAt", "updatedAt", "deletedAt") VALUES ('4889a8e9-58de-422e-9cb1-2a9849420e91', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', 'student@sunrise.edu', '$argon2id$v=19$m=65536,t=3,p=4$xjeGm1PdNV5ue2IVM3szqg$qQe2FG8rDa+xQ/lbAj3l9W8txcXsfwkKO17YhFMnipQ', 'Alex', 'Johnson', NULL, NULL, true, NULL, NULL, NULL, true, '2026-09-04 13:28:03.121', 'en', '2026-09-03 15:18:14.668', '2026-09-04 13:28:03.122', NULL);
INSERT INTO public."User" (id, "organizationId", email, "passwordHash", "firstName", "lastName", "avatarUrl", phone, "isEmailVerified", "emailVerifyToken", "resetToken", "resetTokenExpiry", "isActive", "lastLoginAt", locale, "createdAt", "updatedAt", "deletedAt") VALUES ('83407454-d11d-4026-a86d-064a3e45f933', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', 'parent1@example.com', '$argon2id$v=19$m=65536,t=3,p=4$xjeGm1PdNV5ue2IVM3szqg$qQe2FG8rDa+xQ/lbAj3l9W8txcXsfwkKO17YhFMnipQ', 'Robert', 'Johnson', NULL, NULL, true, NULL, NULL, NULL, true, '2026-09-04 16:12:47.425', 'en', '2026-09-03 15:18:14.611', '2026-09-04 16:12:47.427', NULL);
INSERT INTO public."User" (id, "organizationId", email, "passwordHash", "firstName", "lastName", "avatarUrl", phone, "isEmailVerified", "emailVerifyToken", "resetToken", "resetTokenExpiry", "isActive", "lastLoginAt", locale, "createdAt", "updatedAt", "deletedAt") VALUES ('1b0cb6e1-b800-4e88-aea2-1ef397b652b3', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', 'finance@sunrise.edu', '$argon2id$v=19$m=65536,t=3,p=4$xjeGm1PdNV5ue2IVM3szqg$qQe2FG8rDa+xQ/lbAj3l9W8txcXsfwkKO17YhFMnipQ', 'Priya', 'Sharma', NULL, NULL, true, NULL, NULL, NULL, true, '2026-09-04 17:30:31.2', 'en', '2026-09-03 15:18:14.555', '2026-09-04 17:30:31.201', NULL);
INSERT INTO public."User" (id, "organizationId", email, "passwordHash", "firstName", "lastName", "avatarUrl", phone, "isEmailVerified", "emailVerifyToken", "resetToken", "resetTokenExpiry", "isActive", "lastLoginAt", locale, "createdAt", "updatedAt", "deletedAt") VALUES ('6d5c28e3-25ea-433d-96f7-fc2a2e5b6b8a', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', 'principal@sunrise.edu', '$argon2id$v=19$m=65536,t=3,p=4$xjeGm1PdNV5ue2IVM3szqg$qQe2FG8rDa+xQ/lbAj3l9W8txcXsfwkKO17YhFMnipQ', 'Diana', 'Patel', NULL, NULL, true, NULL, NULL, NULL, true, '2026-09-04 18:14:42.674', 'en', '2026-09-03 15:18:14.518', '2026-09-04 18:14:42.676', NULL);


ALTER TABLE public."User" ENABLE TRIGGER ALL;

--
-- Data for Name: AIConversation; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public."AIConversation" DISABLE TRIGGER ALL;

INSERT INTO public."AIConversation" (id, "organizationId", "userId", title, context, "createdAt", "updatedAt") VALUES ('393bb462-41c9-44d1-ab02-002756611b23', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', '6d5c28e3-25ea-433d-96f7-fc2a2e5b6b8a', 'howare you?', '{"orgName": "Sunrise Montessori Academy"}', '2026-09-05 04:21:49.369', '2026-09-05 04:21:49.369');


ALTER TABLE public."AIConversation" ENABLE TRIGGER ALL;

--
-- Data for Name: AcademicYear; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public."AcademicYear" DISABLE TRIGGER ALL;

INSERT INTO public."AcademicYear" (id, "organizationId", name, "startDate", "endDate", "isCurrent", "createdAt", "updatedAt") VALUES ('525ab945-600e-4bda-9693-f5d4a740ab2d', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', '2026–2027', '2026-08-25 00:00:00', '2027-06-15 00:00:00', true, '2026-09-03 15:18:14.682', '2026-09-03 15:18:14.682');


ALTER TABLE public."AcademicYear" ENABLE TRIGGER ALL;

--
-- Data for Name: Curriculum; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public."Curriculum" DISABLE TRIGGER ALL;

INSERT INTO public."Curriculum" (id, "organizationId", name, description, "isDefault", "targetAgeMin", "targetAgeMax", "createdAt", "updatedAt", "deletedAt") VALUES ('13a8f5b0-7584-41af-9f7b-96b51359dca8', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', 'Toddler Community', NULL, false, 1.5, 3, '2026-09-03 15:18:15.017', '2026-09-03 15:18:15.017', NULL);
INSERT INTO public."Curriculum" (id, "organizationId", name, description, "isDefault", "targetAgeMin", "targetAgeMax", "createdAt", "updatedAt", "deletedAt") VALUES ('3b5a1591-89b5-4e11-8e5e-52e0b2d2825f', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', 'Children''s House (Primary)', NULL, true, 3, 6, '2026-09-03 15:18:15.149', '2026-09-03 15:18:15.149', NULL);
INSERT INTO public."Curriculum" (id, "organizationId", name, description, "isDefault", "targetAgeMin", "targetAgeMax", "createdAt", "updatedAt", "deletedAt") VALUES ('01ec0c01-dcad-4b04-9fbc-0c63fe19760b', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', 'Lower Elementary', NULL, false, 6, 9, '2026-09-03 15:18:15.29', '2026-09-03 15:18:15.29', NULL);
INSERT INTO public."Curriculum" (id, "organizationId", name, description, "isDefault", "targetAgeMin", "targetAgeMax", "createdAt", "updatedAt", "deletedAt") VALUES ('dc180f90-1434-4278-851a-05f41d31bfbf', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', 'Upper Elementary', NULL, false, 9, 12, '2026-09-03 15:18:15.466', '2026-09-03 15:18:15.466', NULL);
INSERT INTO public."Curriculum" (id, "organizationId", name, description, "isDefault", "targetAgeMin", "targetAgeMax", "createdAt", "updatedAt", "deletedAt") VALUES ('5a53f65f-f484-42aa-ae4c-27eacdc79857', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', 'Adolescent', NULL, false, 12, 15, '2026-09-03 15:18:15.617', '2026-09-03 15:18:15.617', NULL);


ALTER TABLE public."Curriculum" ENABLE TRIGGER ALL;

--
-- Data for Name: Classroom; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public."Classroom" DISABLE TRIGGER ALL;

INSERT INTO public."Classroom" (id, "organizationId", "academicYearId", name, "ageGroupMin", "ageGroupMax", capacity, "roomNumber", "curriculumId", "isActive", "createdAt", "updatedAt", "deletedAt") VALUES ('1f21a384-da6c-4753-809a-6fded2b2853e', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', '525ab945-600e-4bda-9693-f5d4a740ab2d', 'Seedlings Room', 1.5, 3, 15, 'T1', '13a8f5b0-7584-41af-9f7b-96b51359dca8', true, '2026-09-03 15:18:14.758', '2026-09-03 15:18:15.671', NULL);
INSERT INTO public."Classroom" (id, "organizationId", "academicYearId", name, "ageGroupMin", "ageGroupMax", capacity, "roomNumber", "curriculumId", "isActive", "createdAt", "updatedAt", "deletedAt") VALUES ('417ddb2d-d8bc-4a2e-ba52-a9717de57923', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', '525ab945-600e-4bda-9693-f5d4a740ab2d', 'Sunflower Room', 3, 6, 20, 'P1', '3b5a1591-89b5-4e11-8e5e-52e0b2d2825f', true, '2026-09-03 15:18:14.798', '2026-09-03 15:18:15.682', NULL);
INSERT INTO public."Classroom" (id, "organizationId", "academicYearId", name, "ageGroupMin", "ageGroupMax", capacity, "roomNumber", "curriculumId", "isActive", "createdAt", "updatedAt", "deletedAt") VALUES ('ed5e82a9-a2c9-4c73-8d1e-a43d6715f035', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', '525ab945-600e-4bda-9693-f5d4a740ab2d', 'Oak Room', 6, 9, 18, 'LE1', '01ec0c01-dcad-4b04-9fbc-0c63fe19760b', true, '2026-09-03 15:18:14.81', '2026-09-03 15:18:15.688', NULL);


ALTER TABLE public."Classroom" ENABLE TRIGGER ALL;

--
-- Data for Name: AIInsight; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public."AIInsight" DISABLE TRIGGER ALL;

INSERT INTO public."AIInsight" (id, "organizationId", "classroomId", "studentId", type, title, summary, "rawStats", "actionItems", "isRead", "generatedAt", "createdAt") VALUES ('930a0f1c-5bbd-4fcf-b8be-efd9fb1600f6', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', '417ddb2d-d8bc-4a2e-ba52-a9717de57923', '218e90cd-6b1e-4214-b8d1-d0813883ee1e', 'ATTENDANCE_PATTERN', 'Attendance concern: Sofia Rivera', 'Sofia Rivera has been absent 4 times this month — twice on Mondays. This pattern may indicate a recurring Monday scheduling conflict or general disengagement. Recommend a family check-in call before the next absence occurs.', '{"absentCount": 4, "mostAbsentDay": "Monday", "consecutiveAbsences": 1}', '{"Contact Carlos Rivera (parent) to discuss attendance","Schedule a welfare check-in for next Monday"}', false, '2026-09-02 15:18:16.949', '2026-09-03 15:18:16.951');
INSERT INTO public."AIInsight" (id, "organizationId", "classroomId", "studentId", type, title, summary, "rawStats", "actionItems", "isRead", "generatedAt", "createdAt") VALUES ('71cb6dc8-cd89-4be8-bde8-8ff4bb64f4d6', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', '417ddb2d-d8bc-4a2e-ba52-a9717de57923', NULL, 'CURRICULUM_GAP', 'Sensorial engagement declining in Sunflower Room', '3 students in Sunflower Room have not had a Sensorial observation logged in over 2 weeks. The Pink Tower and color tablets may need to be re-presented with fresh introductions. Consider scheduling a dedicated Sensorial afternoon.', '{"affectedStudents": 3, "lastSensorialObservationDaysAgo": 16}', '{"Re-present Sensorial materials to identified students","Schedule dedicated Sensorial afternoon block","Review material placement and accessibility"}', false, '2026-09-02 15:18:16.949', '2026-09-03 15:18:16.951');
INSERT INTO public."AIInsight" (id, "organizationId", "classroomId", "studentId", type, title, summary, "rawStats", "actionItems", "isRead", "generatedAt", "createdAt") VALUES ('4d5c987d-2345-4fff-9494-25b3a3322f18', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', NULL, '218e90cd-6b1e-4214-b8d1-d0813883ee1e', 'FEE_DELINQUENCY', 'Fee delinquency risk: Sofia Rivera', 'Invoice INV-2024-002 for Sofia Rivera is 15 days overdue ($1,550.00). Parent has not responded to the first reminder. The risk of continued non-payment is elevated. Recommend a direct phone call from the finance team this week.', '{"invoiceId": "7194efb6-b7db-4495-97ea-feab925a834c", "daysPastDue": 15, "overdueAmountUsd": 1550}', '{"Call Carlos Rivera directly re: overdue invoice","Offer a payment plan if needed","Flag for principal review if no response by Friday"}', false, '2026-09-02 15:18:16.949', '2026-09-03 15:18:16.951');
INSERT INTO public."AIInsight" (id, "organizationId", "classroomId", "studentId", type, title, summary, "rawStats", "actionItems", "isRead", "generatedAt", "createdAt") VALUES ('146dec0f-80b5-4993-92b2-0e996ec29ba0', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', '417ddb2d-d8bc-4a2e-ba52-a9717de57923', 'fa74d8a5-499c-48f3-9eff-a8e304531d8c', 'DAY_REVIEW', 'Alex''s Day in Review — Monday', 'Alex had a wonderful day! He arrived on time and spent over 30 minutes in the Practical Life area, completing the pouring exercise independently — a real milestone moment that earned him his first badge. In Language, he traced sandpaper letters a, m, and s with great concentration. He also joined group singing time and was notably enthusiastic. A great day all around.', '{"date": "2026-09-02T15:18:16.949Z", "badgesEarned": 1, "activitiesCompleted": 3}', '{}', false, '2026-09-02 15:18:16.949', '2026-09-03 15:18:16.951');


ALTER TABLE public."AIInsight" ENABLE TRIGGER ALL;

--
-- Data for Name: AIMessage; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public."AIMessage" DISABLE TRIGGER ALL;

INSERT INTO public."AIMessage" (id, "conversationId", role, content, "toolCalls", "tokenCount", "createdAt") VALUES ('88e138a7-7ed4-48d1-951c-4c7ade9ccd2c', '393bb462-41c9-44d1-ab02-002756611b23', 'user', 'howare you?', NULL, NULL, '2026-09-05 04:21:49.411');
INSERT INTO public."AIMessage" (id, "conversationId", role, content, "toolCalls", "tokenCount", "createdAt") VALUES ('e1fb49d9-89d8-457d-94c9-b564ca9e4ade', '393bb462-41c9-44d1-ab02-002756611b23', 'assistant', 'I''m doing well, thank you! How can I help you today with Sunrise Montessori Academy?', NULL, NULL, '2026-09-05 04:21:50.336');


ALTER TABLE public."AIMessage" ENABLE TRIGGER ALL;

--
-- Data for Name: Announcement; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public."Announcement" DISABLE TRIGGER ALL;

INSERT INTO public."Announcement" (id, "organizationId", "classroomId", "createdByUserId", title, body, "mediaUrls", "isPinned", "publishAt", "expiresAt", "createdAt", "updatedAt", "deletedAt") VALUES ('66ef8d67-263c-49a9-ac84-7e1dad155555', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', '417ddb2d-d8bc-4a2e-ba52-a9717de57923', '74f06c0a-b838-4549-8b86-6a6d386ff69f', 'Autumn Showcase — Friday 3 PM', 'Dear families, join us this Friday at 3 PM for the Autumn Showcase in the Sunflower Room. Children will present their favourite work from the term.', '{}', true, '2026-09-03 15:18:16.883', NULL, '2026-09-03 15:18:16.885', '2026-09-03 15:18:16.885', NULL);
INSERT INTO public."Announcement" (id, "organizationId", "classroomId", "createdByUserId", title, body, "mediaUrls", "isPinned", "publishAt", "expiresAt", "createdAt", "updatedAt", "deletedAt") VALUES ('acde3e6f-a4fb-4cf8-add0-e9b2cd32df62', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', NULL, '6d5c28e3-25ea-433d-96f7-fc2a2e5b6b8a', 'School closed November 28 — Thanksgiving', 'Sunrise Montessori Academy will be closed Thursday, November 28. Classes resume Monday, December 2.', '{}', false, '2026-09-03 15:18:16.884', NULL, '2026-09-03 15:18:16.885', '2026-09-03 15:18:16.885', NULL);


ALTER TABLE public."Announcement" ENABLE TRIGGER ALL;

--
-- Data for Name: Student; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public."Student" DISABLE TRIGGER ALL;

INSERT INTO public."Student" (id, "organizationId", "userId", "joinedAcademicYearId", "studentNumber", "firstName", "lastName", "dateOfBirth", gender, "photoUrl", "bloodGroup", nationality, address, "qrCode", "admissionFeePaid", "isActive", "createdAt", "updatedAt", "deletedAt") VALUES ('fa74d8a5-499c-48f3-9eff-a8e304531d8c', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', '4889a8e9-58de-422e-9cb1-2a9849420e91', NULL, 'STU-001', 'Alex', 'Johnson', '2019-03-15 00:00:00', 'MALE', NULL, NULL, NULL, NULL, 'QR-STU-001-cd2d1e2f', false, true, '2026-09-03 15:18:15.998', '2026-09-03 15:18:15.998', NULL);
INSERT INTO public."Student" (id, "organizationId", "userId", "joinedAcademicYearId", "studentNumber", "firstName", "lastName", "dateOfBirth", gender, "photoUrl", "bloodGroup", nationality, address, "qrCode", "admissionFeePaid", "isActive", "createdAt", "updatedAt", "deletedAt") VALUES ('218e90cd-6b1e-4214-b8d1-d0813883ee1e', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', NULL, NULL, 'STU-002', 'Sofia', 'Rivera', '2020-07-22 00:00:00', 'FEMALE', NULL, NULL, NULL, NULL, 'QR-STU-002-cd2d1e2f', false, true, '2026-09-03 15:18:16.011', '2026-09-03 15:18:16.011', NULL);
INSERT INTO public."Student" (id, "organizationId", "userId", "joinedAcademicYearId", "studentNumber", "firstName", "lastName", "dateOfBirth", gender, "photoUrl", "bloodGroup", nationality, address, "qrCode", "admissionFeePaid", "isActive", "createdAt", "updatedAt", "deletedAt") VALUES ('7c968eac-81f5-44ba-bb7b-08664d16f1a9', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', NULL, NULL, 'STU-003', 'Liam', 'Chen', '2018-11-05 00:00:00', 'MALE', NULL, NULL, NULL, NULL, 'QR-STU-003-cd2d1e2f', false, true, '2026-09-03 15:18:16.02', '2026-09-03 15:18:16.02', NULL);


ALTER TABLE public."Student" ENABLE TRIGGER ALL;

--
-- Data for Name: Enrollment; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public."Enrollment" DISABLE TRIGGER ALL;

INSERT INTO public."Enrollment" (id, "organizationId", "studentId", "classroomId", "academicYearId", status, "enrolledAt", "withdrawnAt", notes, "createdAt", "updatedAt") VALUES ('6b6e8ebd-67e6-4936-9191-a5c12420d3c6', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', 'fa74d8a5-499c-48f3-9eff-a8e304531d8c', '417ddb2d-d8bc-4a2e-ba52-a9717de57923', '525ab945-600e-4bda-9693-f5d4a740ab2d', 'ACTIVE', '2026-08-25 00:00:00', NULL, NULL, '2026-09-03 15:18:16.123', '2026-09-03 15:18:16.123');
INSERT INTO public."Enrollment" (id, "organizationId", "studentId", "classroomId", "academicYearId", status, "enrolledAt", "withdrawnAt", notes, "createdAt", "updatedAt") VALUES ('d7df48e8-53b7-414f-a0ce-bb1fc8bf8b46', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', '218e90cd-6b1e-4214-b8d1-d0813883ee1e', '417ddb2d-d8bc-4a2e-ba52-a9717de57923', '525ab945-600e-4bda-9693-f5d4a740ab2d', 'ACTIVE', '2026-08-25 00:00:00', NULL, NULL, '2026-09-03 15:18:16.151', '2026-09-03 15:18:16.151');
INSERT INTO public."Enrollment" (id, "organizationId", "studentId", "classroomId", "academicYearId", status, "enrolledAt", "withdrawnAt", notes, "createdAt", "updatedAt") VALUES ('ef1e1065-e7a0-44bb-8124-89f86fa57209', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', '7c968eac-81f5-44ba-bb7b-08664d16f1a9', 'ed5e82a9-a2c9-4c73-8d1e-a43d6715f035', '525ab945-600e-4bda-9693-f5d4a740ab2d', 'ACTIVE', '2026-08-25 00:00:00', NULL, NULL, '2026-09-03 15:18:16.16', '2026-09-03 15:18:16.16');


ALTER TABLE public."Enrollment" ENABLE TRIGGER ALL;

--
-- Data for Name: AttendanceRecord; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public."AttendanceRecord" DISABLE TRIGGER ALL;

INSERT INTO public."AttendanceRecord" (id, "organizationId", "enrollmentId", "studentId", "classroomId", date, "checkInAt", "checkOutAt", "checkType", method, status, "markedByUserId", notes, "createdAt", "updatedAt") VALUES ('1c92c98b-ccb2-4f1a-9917-4b4d4a32686e', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', '6b6e8ebd-67e6-4936-9191-a5c12420d3c6', 'fa74d8a5-499c-48f3-9eff-a8e304531d8c', '417ddb2d-d8bc-4a2e-ba52-a9717de57923', '2026-08-30', '2026-08-31 03:10:00', NULL, 'CHECK_IN', 'QR', 'PRESENT', 'dc3fa849-2543-4d90-991b-fd3acacadde4', NULL, '2026-09-03 15:18:16.427', '2026-09-03 15:18:16.427');
INSERT INTO public."AttendanceRecord" (id, "organizationId", "enrollmentId", "studentId", "classroomId", date, "checkInAt", "checkOutAt", "checkType", method, status, "markedByUserId", notes, "createdAt", "updatedAt") VALUES ('41848e0c-6232-4d95-9c88-79fdd92092a2', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', 'd7df48e8-53b7-414f-a0ce-bb1fc8bf8b46', '218e90cd-6b1e-4214-b8d1-d0813883ee1e', '417ddb2d-d8bc-4a2e-ba52-a9717de57923', '2026-08-30', '2026-08-31 03:10:00', NULL, 'CHECK_IN', 'QR', 'PRESENT', 'dc3fa849-2543-4d90-991b-fd3acacadde4', NULL, '2026-09-03 15:18:16.465', '2026-09-03 15:18:16.465');
INSERT INTO public."AttendanceRecord" (id, "organizationId", "enrollmentId", "studentId", "classroomId", date, "checkInAt", "checkOutAt", "checkType", method, status, "markedByUserId", notes, "createdAt", "updatedAt") VALUES ('9d64808b-f5ac-4b64-a5cb-6a88cf5e303e', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', '6b6e8ebd-67e6-4936-9191-a5c12420d3c6', 'fa74d8a5-499c-48f3-9eff-a8e304531d8c', '417ddb2d-d8bc-4a2e-ba52-a9717de57923', '2026-08-31', '2026-09-01 03:35:00', NULL, 'CHECK_IN', 'QR', 'LATE', 'dc3fa849-2543-4d90-991b-fd3acacadde4', NULL, '2026-09-03 15:18:16.476', '2026-09-03 15:18:16.476');
INSERT INTO public."AttendanceRecord" (id, "organizationId", "enrollmentId", "studentId", "classroomId", date, "checkInAt", "checkOutAt", "checkType", method, status, "markedByUserId", notes, "createdAt", "updatedAt") VALUES ('a36ba5e7-68f6-40f3-a119-8fff6526b5fb', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', 'd7df48e8-53b7-414f-a0ce-bb1fc8bf8b46', '218e90cd-6b1e-4214-b8d1-d0813883ee1e', '417ddb2d-d8bc-4a2e-ba52-a9717de57923', '2026-08-31', '2026-09-01 03:10:00', NULL, 'CHECK_IN', 'QR', 'PRESENT', 'dc3fa849-2543-4d90-991b-fd3acacadde4', NULL, '2026-09-03 15:18:16.488', '2026-09-03 15:18:16.488');
INSERT INTO public."AttendanceRecord" (id, "organizationId", "enrollmentId", "studentId", "classroomId", date, "checkInAt", "checkOutAt", "checkType", method, status, "markedByUserId", notes, "createdAt", "updatedAt") VALUES ('830e1d4a-657b-489a-9f58-d46281aa7b7f', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', '6b6e8ebd-67e6-4936-9191-a5c12420d3c6', 'fa74d8a5-499c-48f3-9eff-a8e304531d8c', '417ddb2d-d8bc-4a2e-ba52-a9717de57923', '2026-09-01', '2026-09-02 03:10:00', NULL, 'CHECK_IN', 'QR', 'PRESENT', 'dc3fa849-2543-4d90-991b-fd3acacadde4', NULL, '2026-09-03 15:18:16.502', '2026-09-03 15:18:16.502');
INSERT INTO public."AttendanceRecord" (id, "organizationId", "enrollmentId", "studentId", "classroomId", date, "checkInAt", "checkOutAt", "checkType", method, status, "markedByUserId", notes, "createdAt", "updatedAt") VALUES ('52f879c0-b921-475d-9028-33d595a08b87', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', 'd7df48e8-53b7-414f-a0ce-bb1fc8bf8b46', '218e90cd-6b1e-4214-b8d1-d0813883ee1e', '417ddb2d-d8bc-4a2e-ba52-a9717de57923', '2026-09-01', '2026-09-02 03:10:00', NULL, 'CHECK_IN', 'QR', 'PRESENT', 'dc3fa849-2543-4d90-991b-fd3acacadde4', NULL, '2026-09-03 15:18:16.518', '2026-09-03 15:18:16.518');


ALTER TABLE public."AttendanceRecord" ENABLE TRIGGER ALL;

--
-- Data for Name: AttendanceSummary; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public."AttendanceSummary" DISABLE TRIGGER ALL;

INSERT INTO public."AttendanceSummary" (id, "organizationId", "studentId", "classroomId", month, year, "presentDays", "absentDays", "lateDays", "excusedDays", "totalDays", "attendanceRate", "updatedAt", "createdAt") VALUES ('8db6b7d3-abfc-4584-aee1-f34bc896c7d6', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', 'fa74d8a5-499c-48f3-9eff-a8e304531d8c', '417ddb2d-d8bc-4a2e-ba52-a9717de57923', 9, 2026, 18, 0, 1, 0, 19, 94.7, '2026-09-03 15:18:16.526', '2026-09-03 15:18:16.526');


ALTER TABLE public."AttendanceSummary" ENABLE TRIGGER ALL;

--
-- Data for Name: AuditLog; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public."AuditLog" DISABLE TRIGGER ALL;

INSERT INTO public."AuditLog" (id, "organizationId", "actorId", action, entity, "entityId", changes, "ipAddress", "userAgent", "createdAt") VALUES ('de85046a-02ed-4c8a-abb2-76934fd11997', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', '6d5c28e3-25ea-433d-96f7-fc2a2e5b6b8a', 'CREATE', 'Student', 'fa74d8a5-499c-48f3-9eff-a8e304531d8c', '{"after": {"lastName": "Johnson", "firstName": "Alex", "studentNumber": "STU-001"}}', '192.168.1.10', NULL, '2026-09-03 15:18:17.055');
INSERT INTO public."AuditLog" (id, "organizationId", "actorId", action, entity, "entityId", changes, "ipAddress", "userAgent", "createdAt") VALUES ('85f96cc0-ddd3-415a-8237-d9d665a9567e', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', '1b0cb6e1-b800-4e88-aea2-1ef397b652b3', 'PAYMENT_EDIT', 'Invoice', '7194efb6-b7db-4495-97ea-feab925a834c', '{"after": {"status": "OVERDUE"}, "before": {"status": "SENT"}}', '192.168.1.20', NULL, '2026-09-03 15:18:17.055');
INSERT INTO public."AuditLog" (id, "organizationId", "actorId", action, entity, "entityId", changes, "ipAddress", "userAgent", "createdAt") VALUES ('1c82704e-3a06-4ad9-9554-48d6d1b4abc4', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', '6d5c28e3-25ea-433d-96f7-fc2a2e5b6b8a', 'ROLE_CHANGE', 'User', '74f06c0a-b838-4549-8b86-6a6d386ff69f', '{"after": {"role": "TEACHER"}, "before": {"role": "FRONT_DESK"}}', '192.168.1.10', NULL, '2026-09-03 15:18:17.055');
INSERT INTO public."AuditLog" (id, "organizationId", "actorId", action, entity, "entityId", changes, "ipAddress", "userAgent", "createdAt") VALUES ('c76365ba-74c7-4e8f-be36-9c5742254090', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', '6d5c28e3-25ea-433d-96f7-fc2a2e5b6b8a', 'LOGIN', 'User', '6d5c28e3-25ea-433d-96f7-fc2a2e5b6b8a', 'null', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '2026-09-04 00:49:09.23');
INSERT INTO public."AuditLog" (id, "organizationId", "actorId", action, entity, "entityId", changes, "ipAddress", "userAgent", "createdAt") VALUES ('cd620c63-742f-4ec7-932f-00525893ad43', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', '74f06c0a-b838-4549-8b86-6a6d386ff69f', 'LOGIN', 'User', '74f06c0a-b838-4549-8b86-6a6d386ff69f', 'null', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '2026-09-04 01:06:22.218');
INSERT INTO public."AuditLog" (id, "organizationId", "actorId", action, entity, "entityId", changes, "ipAddress", "userAgent", "createdAt") VALUES ('9e9cbc86-7f25-4710-b31b-1d3e0ca50b50', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', '83407454-d11d-4026-a86d-064a3e45f933', 'LOGIN', 'User', '83407454-d11d-4026-a86d-064a3e45f933', 'null', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '2026-09-04 02:20:16.107');
INSERT INTO public."AuditLog" (id, "organizationId", "actorId", action, entity, "entityId", changes, "ipAddress", "userAgent", "createdAt") VALUES ('97fcffa2-4b94-4561-af79-59acba8a8c0b', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', '74f06c0a-b838-4549-8b86-6a6d386ff69f', 'LOGIN', 'User', '74f06c0a-b838-4549-8b86-6a6d386ff69f', 'null', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '2026-09-04 04:24:05.485');
INSERT INTO public."AuditLog" (id, "organizationId", "actorId", action, entity, "entityId", changes, "ipAddress", "userAgent", "createdAt") VALUES ('07553f78-c720-42cf-bdd0-45028bc752a9', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', '4889a8e9-58de-422e-9cb1-2a9849420e91', 'LOGIN', 'User', '4889a8e9-58de-422e-9cb1-2a9849420e91', 'null', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '2026-09-04 04:44:29.577');
INSERT INTO public."AuditLog" (id, "organizationId", "actorId", action, entity, "entityId", changes, "ipAddress", "userAgent", "createdAt") VALUES ('2f6bf799-42b9-401d-8efa-59f5158b619b', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', '3fcda805-31ba-4596-af43-a3d57babf0d8', 'LOGIN', 'User', '3fcda805-31ba-4596-af43-a3d57babf0d8', 'null', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '2026-09-04 04:48:33.81');
INSERT INTO public."AuditLog" (id, "organizationId", "actorId", action, entity, "entityId", changes, "ipAddress", "userAgent", "createdAt") VALUES ('a08ed5b9-d65b-4b5e-9398-cccaff18bec1', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', '1b0cb6e1-b800-4e88-aea2-1ef397b652b3', 'LOGIN', 'User', '1b0cb6e1-b800-4e88-aea2-1ef397b652b3', 'null', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '2026-09-04 04:49:39.714');
INSERT INTO public."AuditLog" (id, "organizationId", "actorId", action, entity, "entityId", changes, "ipAddress", "userAgent", "createdAt") VALUES ('7d20182a-5141-4f65-b7f7-30112ea88db1', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', 'dc3fa849-2543-4d90-991b-fd3acacadde4', 'LOGIN', 'User', 'dc3fa849-2543-4d90-991b-fd3acacadde4', 'null', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '2026-09-04 04:52:01.757');
INSERT INTO public."AuditLog" (id, "organizationId", "actorId", action, entity, "entityId", changes, "ipAddress", "userAgent", "createdAt") VALUES ('c28cd81c-050e-4b13-91c3-d00cce174200', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', '6d5c28e3-25ea-433d-96f7-fc2a2e5b6b8a', 'LOGIN', 'User', '6d5c28e3-25ea-433d-96f7-fc2a2e5b6b8a', 'null', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '2026-09-04 07:16:14.28');
INSERT INTO public."AuditLog" (id, "organizationId", "actorId", action, entity, "entityId", changes, "ipAddress", "userAgent", "createdAt") VALUES ('7e4af59f-0f16-467b-9e5c-d27db9d31467', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', '6d5c28e3-25ea-433d-96f7-fc2a2e5b6b8a', 'LOGIN', 'User', '6d5c28e3-25ea-433d-96f7-fc2a2e5b6b8a', 'null', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '2026-09-04 10:20:38.834');
INSERT INTO public."AuditLog" (id, "organizationId", "actorId", action, entity, "entityId", changes, "ipAddress", "userAgent", "createdAt") VALUES ('037ab0e6-900c-49c8-8b30-f9cbfeade700', NULL, '304d564b-7ce6-4ef3-b27c-2b7709881448', 'LOGIN', 'User', '304d564b-7ce6-4ef3-b27c-2b7709881448', 'null', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '2026-09-04 13:02:06.369');
INSERT INTO public."AuditLog" (id, "organizationId", "actorId", action, entity, "entityId", changes, "ipAddress", "userAgent", "createdAt") VALUES ('62d75d4f-2ce3-4182-a1e5-af258b33d555', NULL, '304d564b-7ce6-4ef3-b27c-2b7709881448', 'LOGIN', 'User', '304d564b-7ce6-4ef3-b27c-2b7709881448', 'null', '::1', NULL, '2026-09-04 13:18:26.942');
INSERT INTO public."AuditLog" (id, "organizationId", "actorId", action, entity, "entityId", changes, "ipAddress", "userAgent", "createdAt") VALUES ('b26193a2-c8c4-4be0-a811-519337a20faa', NULL, '304d564b-7ce6-4ef3-b27c-2b7709881448', 'LOGIN', 'User', '304d564b-7ce6-4ef3-b27c-2b7709881448', 'null', '::1', NULL, '2026-09-04 13:20:36.582');
INSERT INTO public."AuditLog" (id, "organizationId", "actorId", action, entity, "entityId", changes, "ipAddress", "userAgent", "createdAt") VALUES ('48857df1-0605-41e7-bafb-7eae73ba3e29', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', '4889a8e9-58de-422e-9cb1-2a9849420e91', 'LOGIN', 'User', '4889a8e9-58de-422e-9cb1-2a9849420e91', 'null', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '2026-09-04 13:28:03.13');
INSERT INTO public."AuditLog" (id, "organizationId", "actorId", action, entity, "entityId", changes, "ipAddress", "userAgent", "createdAt") VALUES ('346a5c48-4eff-46f9-9e2b-702bba9b15d9', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', '83407454-d11d-4026-a86d-064a3e45f933', 'LOGIN', 'User', '83407454-d11d-4026-a86d-064a3e45f933', 'null', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '2026-09-04 16:12:47.452');
INSERT INTO public."AuditLog" (id, "organizationId", "actorId", action, entity, "entityId", changes, "ipAddress", "userAgent", "createdAt") VALUES ('6a5146e4-3074-4a4d-a10f-9b54411b15bd', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', '6d5c28e3-25ea-433d-96f7-fc2a2e5b6b8a', 'PAYMENT_EDIT', 'Payment', '64b5ab4a-e2af-4d5d-b842-aeb87281dd3e', '{"after": {"amount": 1550, "invoiceId": "7194efb6-b7db-4495-97ea-feab925a834c"}}', NULL, NULL, '2026-09-04 17:21:48.727');
INSERT INTO public."AuditLog" (id, "organizationId", "actorId", action, entity, "entityId", changes, "ipAddress", "userAgent", "createdAt") VALUES ('29322054-d7af-48c6-90d9-4a1d86866502', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', '1b0cb6e1-b800-4e88-aea2-1ef397b652b3', 'LOGIN', 'User', '1b0cb6e1-b800-4e88-aea2-1ef397b652b3', 'null', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '2026-09-04 17:30:31.206');
INSERT INTO public."AuditLog" (id, "organizationId", "actorId", action, entity, "entityId", changes, "ipAddress", "userAgent", "createdAt") VALUES ('44b75d57-60b9-40b2-bf4a-f7dcc2c44209', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', '6d5c28e3-25ea-433d-96f7-fc2a2e5b6b8a', 'LOGIN', 'User', '6d5c28e3-25ea-433d-96f7-fc2a2e5b6b8a', 'null', '::1', 'node', '2026-09-04 18:14:42.685');
INSERT INTO public."AuditLog" (id, "organizationId", "actorId", action, entity, "entityId", changes, "ipAddress", "userAgent", "createdAt") VALUES ('ed93a415-3bb9-4d7b-9e14-e4728b35ec6c', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', '6d5c28e3-25ea-433d-96f7-fc2a2e5b6b8a', 'CREATE', 'Payroll', '5c6bdd1a-f9e3-4b8e-a390-ee7aa9c1af21', '{"after": {"year": 2026, "month": 9, "netPay": 55000, "staffId": "5867f2a0-dab4-47db-8046-3c20d310ca8d"}}', NULL, NULL, '2026-09-05 03:28:42.696');


ALTER TABLE public."AuditLog" ENABLE TRIGGER ALL;

--
-- Data for Name: Badge; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public."Badge" DISABLE TRIGGER ALL;

INSERT INTO public."Badge" (id, "organizationId", name, description, "iconUrl", "colorHex", points, "isActive", "createdAt", "updatedAt") VALUES ('c74406b9-c8db-4711-9c9d-271b38013856', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', 'First Steps', 'Completed first Practical Life activity independently', NULL, '#5C7A5A', 10, true, '2026-09-03 15:18:16.746', '2026-09-03 15:18:16.746');
INSERT INTO public."Badge" (id, "organizationId", name, description, "iconUrl", "colorHex", points, "isActive", "createdAt", "updatedAt") VALUES ('9f6699f6-6884-455b-b22b-91eed101d8bd', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', 'Word Builder', 'Built first word using the Moveable Alphabet', NULL, '#3E4C8C', 20, true, '2026-09-03 15:18:16.753', '2026-09-03 15:18:16.753');
INSERT INTO public."Badge" (id, "organizationId", name, description, "iconUrl", "colorHex", points, "isActive", "createdAt", "updatedAt") VALUES ('9690b5b8-47c3-45b8-b1ad-70bc7efd6ab5', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', 'Math Whiz', 'Mastered Number Rods 1–10', NULL, '#C1694F', 25, true, '2026-09-03 15:18:16.76', '2026-09-03 15:18:16.76');
INSERT INTO public."Badge" (id, "organizationId", name, description, "iconUrl", "colorHex", points, "isActive", "createdAt", "updatedAt") VALUES ('a5401010-88f1-477b-9daf-15706dfb9485', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', 'Golden Achiever', 'Worked independently with Golden Bead Material', NULL, '#E3A83D', 50, true, '2026-09-03 15:18:16.766', '2026-09-03 15:18:16.766');
INSERT INTO public."Badge" (id, "organizationId", name, description, "iconUrl", "colorHex", points, "isActive", "createdAt", "updatedAt") VALUES ('8488b598-94a6-48b5-afe1-af7c5ea4b95e', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', 'Attendance Star', 'Perfect attendance for a full calendar month', NULL, '#E3A83D', 15, true, '2026-09-03 15:18:16.773', '2026-09-03 15:18:16.773');


ALTER TABLE public."Badge" ENABLE TRIGGER ALL;

--
-- Data for Name: Staff; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public."Staff" DISABLE TRIGGER ALL;

INSERT INTO public."Staff" (id, "organizationId", "userId", "employeeNumber", "jobTitle", department, "employmentType", "startDate", "endDate", salary, currency, qualifications, certifications, "isActive", "createdAt", "updatedAt", "deletedAt") VALUES ('5867f2a0-dab4-47db-8046-3c20d310ca8d', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', '74f06c0a-b838-4549-8b86-6a6d386ff69f', 'EMP-001', 'Lead Teacher', 'Primary', 'FULL_TIME', '2022-08-01 00:00:00', NULL, 55000.00, 'USD', '{B.Ed,"Montessori AMI Diploma"}', '{}', true, '2026-09-03 15:18:14.828', '2026-09-03 15:18:14.828', NULL);
INSERT INTO public."Staff" (id, "organizationId", "userId", "employeeNumber", "jobTitle", department, "employmentType", "startDate", "endDate", salary, currency, qualifications, certifications, "isActive", "createdAt", "updatedAt", "deletedAt") VALUES ('d1c5ac69-8593-4c3c-9a3c-5394550609e2', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', '199eb894-54cd-453f-9418-6cc70d83f1c6', 'EMP-2811', 'Admin/Teacher', NULL, 'FULL_TIME', '2026-09-04 15:29:33.134', NULL, NULL, 'USD', '{}', '{}', true, '2026-09-04 15:29:33.14', '2026-09-04 15:29:33.14', NULL);
INSERT INTO public."Staff" (id, "organizationId", "userId", "employeeNumber", "jobTitle", department, "employmentType", "startDate", "endDate", salary, currency, qualifications, certifications, "isActive", "createdAt", "updatedAt", "deletedAt") VALUES ('c639b4ff-02d3-4d5f-9981-863116b79257', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', 'dc75a027-8b85-46c1-9621-c7d765a819e5', 'EMP-6452', 'Admin/Teacher', NULL, 'FULL_TIME', '2026-09-04 15:29:33.144', NULL, NULL, 'USD', '{}', '{}', true, '2026-09-04 15:29:33.149', '2026-09-04 15:29:33.149', NULL);
INSERT INTO public."Staff" (id, "organizationId", "userId", "employeeNumber", "jobTitle", department, "employmentType", "startDate", "endDate", salary, currency, qualifications, certifications, "isActive", "createdAt", "updatedAt", "deletedAt") VALUES ('aab71fa5-94cd-499e-98c9-2bea95cfdaa2', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', '83407454-d11d-4026-a86d-064a3e45f933', 'EMP-2173', 'Admin/Teacher', NULL, 'FULL_TIME', '2026-09-04 15:29:33.15', NULL, NULL, 'USD', '{}', '{}', true, '2026-09-04 15:29:33.155', '2026-09-04 15:29:33.155', NULL);
INSERT INTO public."Staff" (id, "organizationId", "userId", "employeeNumber", "jobTitle", department, "employmentType", "startDate", "endDate", salary, currency, qualifications, certifications, "isActive", "createdAt", "updatedAt", "deletedAt") VALUES ('ce68973c-c98f-46ed-8e8b-faf2a324ee60', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', '3fcda805-31ba-4596-af43-a3d57babf0d8', 'EMP-8583', 'Admin/Teacher', NULL, 'FULL_TIME', '2026-09-04 15:29:33.154', NULL, NULL, 'USD', '{}', '{}', true, '2026-09-04 15:29:33.159', '2026-09-04 15:29:33.159', NULL);
INSERT INTO public."Staff" (id, "organizationId", "userId", "employeeNumber", "jobTitle", department, "employmentType", "startDate", "endDate", salary, currency, qualifications, certifications, "isActive", "createdAt", "updatedAt", "deletedAt") VALUES ('f322070c-254b-4a11-82e8-3f6b2ed549a8', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', '1b0cb6e1-b800-4e88-aea2-1ef397b652b3', 'EMP-1057', 'Admin/Teacher', NULL, 'FULL_TIME', '2026-09-04 15:29:33.158', NULL, NULL, 'USD', '{}', '{}', true, '2026-09-04 15:29:33.163', '2026-09-04 15:29:33.163', NULL);
INSERT INTO public."Staff" (id, "organizationId", "userId", "employeeNumber", "jobTitle", department, "employmentType", "startDate", "endDate", salary, currency, qualifications, certifications, "isActive", "createdAt", "updatedAt", "deletedAt") VALUES ('b3d23ff5-ed42-4912-b8f9-4a6e039deb97', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', 'dc3fa849-2543-4d90-991b-fd3acacadde4', 'EMP-3432', 'Admin/Teacher', NULL, 'FULL_TIME', '2026-09-04 15:29:33.162', NULL, NULL, 'USD', '{}', '{}', true, '2026-09-04 15:29:33.168', '2026-09-04 15:29:33.168', NULL);
INSERT INTO public."Staff" (id, "organizationId", "userId", "employeeNumber", "jobTitle", department, "employmentType", "startDate", "endDate", salary, currency, qualifications, certifications, "isActive", "createdAt", "updatedAt", "deletedAt") VALUES ('368491d5-3b52-4217-84fa-c162eebafd6b', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', '6d5c28e3-25ea-433d-96f7-fc2a2e5b6b8a', 'EMP-386', 'Admin/Teacher', NULL, 'FULL_TIME', '2026-09-04 15:29:33.167', NULL, NULL, 'USD', '{}', '{}', true, '2026-09-04 15:29:33.172', '2026-09-04 15:29:33.172', NULL);
INSERT INTO public."Staff" (id, "organizationId", "userId", "employeeNumber", "jobTitle", department, "employmentType", "startDate", "endDate", salary, currency, qualifications, certifications, "isActive", "createdAt", "updatedAt", "deletedAt") VALUES ('5e4cbdb1-b03c-4741-9ef9-57d536fd4037', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', '4889a8e9-58de-422e-9cb1-2a9849420e91', 'EMP-2020', 'Admin/Teacher', NULL, 'FULL_TIME', '2026-09-04 15:30:19.305', NULL, NULL, 'USD', '{}', '{}', true, '2026-09-04 15:30:19.313', '2026-09-04 15:30:19.313', NULL);
INSERT INTO public."Staff" (id, "organizationId", "userId", "employeeNumber", "jobTitle", department, "employmentType", "startDate", "endDate", salary, currency, qualifications, certifications, "isActive", "createdAt", "updatedAt", "deletedAt") VALUES ('8e431fa9-38cd-4fbd-aea3-bd183e51a738', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', '304d564b-7ce6-4ef3-b27c-2b7709881448', 'SUPER-863', 'SuperAdmin', NULL, 'FULL_TIME', '2026-09-04 15:32:21.342', NULL, NULL, 'USD', '{}', '{}', true, '2026-09-04 15:32:21.354', '2026-09-04 15:32:21.354', NULL);


ALTER TABLE public."Staff" ENABLE TRIGGER ALL;

--
-- Data for Name: ClassroomStaff; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public."ClassroomStaff" DISABLE TRIGGER ALL;

INSERT INTO public."ClassroomStaff" (id, "classroomId", "staffId", "isPrimary", "assignedAt") VALUES ('f0ddb943-154a-4141-8ad1-7f3edeec11a7', '417ddb2d-d8bc-4a2e-ba52-a9717de57923', '5867f2a0-dab4-47db-8046-3c20d310ca8d', true, '2026-09-03 15:18:14.862');


ALTER TABLE public."ClassroomStaff" ENABLE TRIGGER ALL;

--
-- Data for Name: CurriculumArea; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public."CurriculumArea" DISABLE TRIGGER ALL;

INSERT INTO public."CurriculumArea" (id, "curriculumId", name, description, "colorHex", "iconName", "sortOrder", "createdAt", "updatedAt") VALUES ('0a8e1f0b-7572-4b48-97bd-40a251d467c3', '13a8f5b0-7584-41af-9f7b-96b51359dca8', 'Practical Life', NULL, '#4CAF50', 'Hand', 0, '2026-09-03 15:18:15.035', '2026-09-03 15:18:15.035');
INSERT INTO public."CurriculumArea" (id, "curriculumId", name, description, "colorHex", "iconName", "sortOrder", "createdAt", "updatedAt") VALUES ('03421643-600a-42ba-8e80-c84cc7e5f0ec', '13a8f5b0-7584-41af-9f7b-96b51359dca8', 'Sensorial', NULL, '#FF9800', 'Eye', 1, '2026-09-03 15:18:15.048', '2026-09-03 15:18:15.048');
INSERT INTO public."CurriculumArea" (id, "curriculumId", name, description, "colorHex", "iconName", "sortOrder", "createdAt", "updatedAt") VALUES ('42726bad-7c9e-4511-85ec-55cfda05be93', '13a8f5b0-7584-41af-9f7b-96b51359dca8', 'Language', NULL, '#2196F3', 'MessageCircle', 2, '2026-09-03 15:18:15.099', '2026-09-03 15:18:15.099');
INSERT INTO public."CurriculumArea" (id, "curriculumId", name, description, "colorHex", "iconName", "sortOrder", "createdAt", "updatedAt") VALUES ('8dd2e62e-9db6-4d65-a938-903703e37544', '13a8f5b0-7584-41af-9f7b-96b51359dca8', 'Motor Skills', NULL, '#9C27B0', 'Activity', 3, '2026-09-03 15:18:15.12', '2026-09-03 15:18:15.12');
INSERT INTO public."CurriculumArea" (id, "curriculumId", name, description, "colorHex", "iconName", "sortOrder", "createdAt", "updatedAt") VALUES ('410af4f9-f133-4f31-91b2-95d8491a446d', '3b5a1591-89b5-4e11-8e5e-52e0b2d2825f', 'Practical Life', NULL, '#4CAF50', 'Hand', 0, '2026-09-03 15:18:15.172', '2026-09-03 15:18:15.172');
INSERT INTO public."CurriculumArea" (id, "curriculumId", name, description, "colorHex", "iconName", "sortOrder", "createdAt", "updatedAt") VALUES ('b4adb2c3-1e9c-41ef-bc93-64cb32a602ca', '3b5a1591-89b5-4e11-8e5e-52e0b2d2825f', 'Sensorial', NULL, '#FF9800', 'Eye', 1, '2026-09-03 15:18:15.234', '2026-09-03 15:18:15.234');
INSERT INTO public."CurriculumArea" (id, "curriculumId", name, description, "colorHex", "iconName", "sortOrder", "createdAt", "updatedAt") VALUES ('27220259-7054-4a57-835f-45e49c95828b', '3b5a1591-89b5-4e11-8e5e-52e0b2d2825f', 'Language', NULL, '#2196F3', 'MessageCircle', 2, '2026-09-03 15:18:15.248', '2026-09-03 15:18:15.248');
INSERT INTO public."CurriculumArea" (id, "curriculumId", name, description, "colorHex", "iconName", "sortOrder", "createdAt", "updatedAt") VALUES ('52924826-916b-4fe1-815e-e09cc3402766', '3b5a1591-89b5-4e11-8e5e-52e0b2d2825f', 'Mathematics', NULL, '#F44336', 'Hash', 3, '2026-09-03 15:18:15.254', '2026-09-03 15:18:15.254');
INSERT INTO public."CurriculumArea" (id, "curriculumId", name, description, "colorHex", "iconName", "sortOrder", "createdAt", "updatedAt") VALUES ('68d12126-3295-472e-94ee-3c6ac5be89ce', '3b5a1591-89b5-4e11-8e5e-52e0b2d2825f', 'Cultural Studies', NULL, '#9C27B0', 'Globe', 4, '2026-09-03 15:18:15.27', '2026-09-03 15:18:15.27');
INSERT INTO public."CurriculumArea" (id, "curriculumId", name, description, "colorHex", "iconName", "sortOrder", "createdAt", "updatedAt") VALUES ('df7cc4eb-f76e-47b9-981f-38201faa8a95', '01ec0c01-dcad-4b04-9fbc-0c63fe19760b', 'Mathematics', NULL, '#F44336', 'Hash', 0, '2026-09-03 15:18:15.317', '2026-09-03 15:18:15.317');
INSERT INTO public."CurriculumArea" (id, "curriculumId", name, description, "colorHex", "iconName", "sortOrder", "createdAt", "updatedAt") VALUES ('28ad6735-113f-440e-b93f-630fbae32254', '01ec0c01-dcad-4b04-9fbc-0c63fe19760b', 'Geometry', NULL, '#E91E63', 'Triangle', 1, '2026-09-03 15:18:15.325', '2026-09-03 15:18:15.325');
INSERT INTO public."CurriculumArea" (id, "curriculumId", name, description, "colorHex", "iconName", "sortOrder", "createdAt", "updatedAt") VALUES ('6c17e79c-7328-42e6-a189-2182b87749fb', '01ec0c01-dcad-4b04-9fbc-0c63fe19760b', 'Language', NULL, '#2196F3', 'MessageCircle', 2, '2026-09-03 15:18:15.345', '2026-09-03 15:18:15.345');
INSERT INTO public."CurriculumArea" (id, "curriculumId", name, description, "colorHex", "iconName", "sortOrder", "createdAt", "updatedAt") VALUES ('8e20bbdd-4460-4314-ab9d-39b20dbd85b1', '01ec0c01-dcad-4b04-9fbc-0c63fe19760b', 'Biology', NULL, '#4CAF50', 'Leaf', 3, '2026-09-03 15:18:15.367', '2026-09-03 15:18:15.367');
INSERT INTO public."CurriculumArea" (id, "curriculumId", name, description, "colorHex", "iconName", "sortOrder", "createdAt", "updatedAt") VALUES ('ed2d0d7c-91ef-437d-bc97-23e2115a7584', '01ec0c01-dcad-4b04-9fbc-0c63fe19760b', 'Geography', NULL, '#00BCD4', 'Globe', 4, '2026-09-03 15:18:15.385', '2026-09-03 15:18:15.385');
INSERT INTO public."CurriculumArea" (id, "curriculumId", name, description, "colorHex", "iconName", "sortOrder", "createdAt", "updatedAt") VALUES ('3d9a77d2-468a-4d36-8f82-b7531bb40a7c', '01ec0c01-dcad-4b04-9fbc-0c63fe19760b', 'History', NULL, '#795548', 'Clock', 5, '2026-09-03 15:18:15.444', '2026-09-03 15:18:15.444');
INSERT INTO public."CurriculumArea" (id, "curriculumId", name, description, "colorHex", "iconName", "sortOrder", "createdAt", "updatedAt") VALUES ('566d8fd3-bc91-439d-b2b6-b68fa1bd90e1', 'dc180f90-1434-4278-851a-05f41d31bfbf', 'Mathematics', NULL, '#F44336', 'Hash', 0, '2026-09-03 15:18:15.478', '2026-09-03 15:18:15.478');
INSERT INTO public."CurriculumArea" (id, "curriculumId", name, description, "colorHex", "iconName", "sortOrder", "createdAt", "updatedAt") VALUES ('1002dc66-50c8-4ac7-b1ef-90eaafad8b35', 'dc180f90-1434-4278-851a-05f41d31bfbf', 'Geometry', NULL, '#E91E63', 'Triangle', 1, '2026-09-03 15:18:15.5', '2026-09-03 15:18:15.5');
INSERT INTO public."CurriculumArea" (id, "curriculumId", name, description, "colorHex", "iconName", "sortOrder", "createdAt", "updatedAt") VALUES ('08f14806-8773-456f-8e15-9e081a789787', 'dc180f90-1434-4278-851a-05f41d31bfbf', 'Language', NULL, '#2196F3', 'MessageCircle', 2, '2026-09-03 15:18:15.543', '2026-09-03 15:18:15.543');
INSERT INTO public."CurriculumArea" (id, "curriculumId", name, description, "colorHex", "iconName", "sortOrder", "createdAt", "updatedAt") VALUES ('bf6b9ca1-4945-41d8-bf82-0cc4ab4f755c', 'dc180f90-1434-4278-851a-05f41d31bfbf', 'Biology', NULL, '#4CAF50', 'Leaf', 3, '2026-09-03 15:18:15.557', '2026-09-03 15:18:15.557');
INSERT INTO public."CurriculumArea" (id, "curriculumId", name, description, "colorHex", "iconName", "sortOrder", "createdAt", "updatedAt") VALUES ('8680b6f4-8407-495a-b55d-55212d928098', 'dc180f90-1434-4278-851a-05f41d31bfbf', 'Geography', NULL, '#00BCD4', 'Globe', 4, '2026-09-03 15:18:15.602', '2026-09-03 15:18:15.602');
INSERT INTO public."CurriculumArea" (id, "curriculumId", name, description, "colorHex", "iconName", "sortOrder", "createdAt", "updatedAt") VALUES ('dc878fd4-0fdc-4ff4-8b81-be235c3f9fe1', 'dc180f90-1434-4278-851a-05f41d31bfbf', 'History', NULL, '#795548', 'Clock', 5, '2026-09-03 15:18:15.608', '2026-09-03 15:18:15.608');
INSERT INTO public."CurriculumArea" (id, "curriculumId", name, description, "colorHex", "iconName", "sortOrder", "createdAt", "updatedAt") VALUES ('0e7533bf-ddf1-4e2b-9d0a-6b347ac398b6', '5a53f65f-f484-42aa-ae4c-27eacdc79857', 'Occupations', NULL, '#795548', 'Briefcase', 0, '2026-09-03 15:18:15.632', '2026-09-03 15:18:15.632');
INSERT INTO public."CurriculumArea" (id, "curriculumId", name, description, "colorHex", "iconName", "sortOrder", "createdAt", "updatedAt") VALUES ('932c6b54-1ff6-400e-bdd4-f467c7d48537', '5a53f65f-f484-42aa-ae4c-27eacdc79857', 'Humanities', NULL, '#9C27B0', 'Users', 1, '2026-09-03 15:18:15.643', '2026-09-03 15:18:15.643');
INSERT INTO public."CurriculumArea" (id, "curriculumId", name, description, "colorHex", "iconName", "sortOrder", "createdAt", "updatedAt") VALUES ('c10dac3f-4226-42c1-9039-50ca254ad7e4', '5a53f65f-f484-42aa-ae4c-27eacdc79857', 'Sciences', NULL, '#00BCD4', 'Activity', 2, '2026-09-03 15:18:15.657', '2026-09-03 15:18:15.657');
INSERT INTO public."CurriculumArea" (id, "curriculumId", name, description, "colorHex", "iconName", "sortOrder", "createdAt", "updatedAt") VALUES ('81e23ddf-ea11-4cea-a9fa-24c0b7389893', '5a53f65f-f484-42aa-ae4c-27eacdc79857', 'Expression', NULL, '#E91E63', 'Heart', 3, '2026-09-03 15:18:15.664', '2026-09-03 15:18:15.664');


ALTER TABLE public."CurriculumArea" ENABLE TRIGGER ALL;

--
-- Data for Name: EmergencyContact; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public."EmergencyContact" DISABLE TRIGGER ALL;

INSERT INTO public."EmergencyContact" (id, "studentId", name, relationship, phone, "altPhone", "createdAt", "updatedAt") VALUES ('ead25470-5ec4-415b-b7af-5d79e6ce3116', 'fa74d8a5-499c-48f3-9eff-a8e304531d8c', 'Grandma Susan Johnson', 'Grandmother', '+1-555-0201', NULL, '2026-09-03 15:18:16.048', '2026-09-03 15:18:16.048');


ALTER TABLE public."EmergencyContact" ENABLE TRIGGER ALL;

--
-- Data for Name: Event; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public."Event" DISABLE TRIGGER ALL;



ALTER TABLE public."Event" ENABLE TRIGGER ALL;

--
-- Data for Name: Expense; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public."Expense" DISABLE TRIGGER ALL;

INSERT INTO public."Expense" (id, "organizationId", category, description, amount, currency, "receiptUrl", "expenseDate", "approvedByUserId", "createdAt", "updatedAt", "deletedAt") VALUES ('3944de02-a10c-4dcf-910c-e2884d545824', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', 'SUPPLIES', 'Classroom materials restock — Q4 2024', 840.50, 'USD', NULL, '2026-08-24 15:18:16.658', '6d5c28e3-25ea-433d-96f7-fc2a2e5b6b8a', '2026-09-03 15:18:16.66', '2026-09-03 15:18:16.66', NULL);


ALTER TABLE public."Expense" ENABLE TRIGGER ALL;

--
-- Data for Name: FeeStructure; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public."FeeStructure" DISABLE TRIGGER ALL;

INSERT INTO public."FeeStructure" (id, "organizationId", "classroomId", "academicYearId", name, description, amount, currency, frequency, "isActive", "createdAt", "updatedAt", "deletedAt") VALUES ('78f19c00-5f1c-4889-bf5d-b6451e6e96a3', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', NULL, '525ab945-600e-4bda-9693-f5d4a740ab2d', 'Primary Program — Monthly Tuition', 'Monthly tuition fee for Primary (3–6) program', 1200.00, 'USD', 'MONTHLY', true, '2026-09-03 15:18:16.568', '2026-09-03 15:18:16.568', NULL);
INSERT INTO public."FeeStructure" (id, "organizationId", "classroomId", "academicYearId", name, description, amount, currency, frequency, "isActive", "createdAt", "updatedAt", "deletedAt") VALUES ('5f08f0c3-f2d8-4c2e-85fb-aa169c99c7c1', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', NULL, '525ab945-600e-4bda-9693-f5d4a740ab2d', 'Annual Registration Fee', 'One-time annual registration and materials fee', 350.00, 'USD', 'ANNUALLY', true, '2026-09-03 15:18:16.578', '2026-09-03 15:18:16.578', NULL);


ALTER TABLE public."FeeStructure" ENABLE TRIGGER ALL;

--
-- Data for Name: Guardian; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public."Guardian" DISABLE TRIGGER ALL;

INSERT INTO public."Guardian" (id, "organizationId", "userId", "firstName", "lastName", relationship, phone, "altPhone", email, occupation, address, "photoUrl", "createdAt", "updatedAt", "deletedAt") VALUES ('e399d53b-e233-4365-b30a-d1aeaec0012f', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', '83407454-d11d-4026-a86d-064a3e45f933', 'Robert', 'Johnson', 'Father', '+1-555-0300', NULL, 'parent1@example.com', 'Software Engineer', NULL, NULL, '2026-09-03 15:18:16.062', '2026-09-03 15:18:16.062', NULL);
INSERT INTO public."Guardian" (id, "organizationId", "userId", "firstName", "lastName", relationship, phone, "altPhone", email, occupation, address, "photoUrl", "createdAt", "updatedAt", "deletedAt") VALUES ('e38baae9-9531-45a0-95fc-b1c1b79c1819', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', '199eb894-54cd-453f-9418-6cc70d83f1c6', 'Emily', 'Johnson', 'Mother', '+1-555-0301', NULL, 'parent2@example.com', 'High School Teacher', NULL, NULL, '2026-09-03 15:18:16.078', '2026-09-03 15:18:16.078', NULL);
INSERT INTO public."Guardian" (id, "organizationId", "userId", "firstName", "lastName", relationship, phone, "altPhone", email, occupation, address, "photoUrl", "createdAt", "updatedAt", "deletedAt") VALUES ('99fdcf8e-b210-4200-89e1-1e072ddc2e66', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', 'dc75a027-8b85-46c1-9621-c7d765a819e5', 'Carlos', 'Rivera', 'Father', '+1-555-0302', NULL, 'parent3@example.com', 'Architect', NULL, NULL, '2026-09-03 15:18:16.085', '2026-09-03 15:18:16.085', NULL);


ALTER TABLE public."Guardian" ENABLE TRIGGER ALL;

--
-- Data for Name: InventoryCategory; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public."InventoryCategory" DISABLE TRIGGER ALL;

INSERT INTO public."InventoryCategory" (id, "organizationId", name, description, "parentId", "createdAt", "updatedAt") VALUES ('ebe12c04-70e9-4e8f-8cd5-e68a8d19dbaa', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', 'Montessori Materials', 'Core Montessori classroom apparatus', NULL, '2026-09-03 15:18:16.673', '2026-09-03 15:18:16.673');


ALTER TABLE public."InventoryCategory" ENABLE TRIGGER ALL;

--
-- Data for Name: Material; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public."Material" DISABLE TRIGGER ALL;

INSERT INTO public."Material" (id, "organizationId", name, description, "imageUrl", "ageGroupMin", "ageGroupMax", "isActive", "createdAt", "updatedAt", "deletedAt") VALUES ('cdaebcd6-4da4-45b7-b86d-96049f70ce32', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', 'Pink Tower', '10 pink cubes graduated in size', NULL, 2.5, 4, true, '2026-09-03 15:18:15.874', '2026-09-03 15:18:15.874', NULL);
INSERT INTO public."Material" (id, "organizationId", name, description, "imageUrl", "ageGroupMin", "ageGroupMax", "isActive", "createdAt", "updatedAt", "deletedAt") VALUES ('c5860d71-a3b4-46f1-809f-01a8646887db', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', 'Sandpaper Letters', 'Lower-case sandpaper letters on boards', NULL, 3, 5, true, '2026-09-03 15:18:15.887', '2026-09-03 15:18:15.887', NULL);
INSERT INTO public."Material" (id, "organizationId", name, description, "imageUrl", "ageGroupMin", "ageGroupMax", "isActive", "createdAt", "updatedAt", "deletedAt") VALUES ('c07ac4cb-6af3-4e89-9577-752c3cb14509', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', 'Golden Bead Material', 'Decimal system bead material', NULL, 4.5, 6.5, true, '2026-09-03 15:18:15.918', '2026-09-03 15:18:15.918', NULL);
INSERT INTO public."Material" (id, "organizationId", name, description, "imageUrl", "ageGroupMin", "ageGroupMax", "isActive", "createdAt", "updatedAt", "deletedAt") VALUES ('d7c6aa3a-b3f6-482f-bcb9-b5a51804effb', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', 'Number Rods', 'Red and blue graduated number rods', NULL, 3, 4.5, true, '2026-09-03 15:18:15.938', '2026-09-03 15:18:15.938', NULL);
INSERT INTO public."Material" (id, "organizationId", name, description, "imageUrl", "ageGroupMin", "ageGroupMax", "isActive", "createdAt", "updatedAt", "deletedAt") VALUES ('251dc07a-9217-429c-af16-d239024cc28d', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', 'Moveable Alphabet', 'Wooden letters for word building', NULL, 4, 6, true, '2026-09-03 15:18:15.951', '2026-09-03 15:18:15.951', NULL);
INSERT INTO public."Material" (id, "organizationId", name, description, "imageUrl", "ageGroupMin", "ageGroupMax", "isActive", "createdAt", "updatedAt", "deletedAt") VALUES ('0a2c1499-8bb3-4e9a-8628-bedddad6c4d7', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', 'Binomial Cube', 'Three-dimensional algebraic cube', NULL, 4.5, 6.5, true, '2026-09-03 15:18:15.958', '2026-09-03 15:18:15.958', NULL);


ALTER TABLE public."Material" ENABLE TRIGGER ALL;

--
-- Data for Name: Supplier; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public."Supplier" DISABLE TRIGGER ALL;

INSERT INTO public."Supplier" (id, "organizationId", name, "contactName", email, phone, address, website, notes, "isActive", "createdAt", "updatedAt", "deletedAt") VALUES ('5f98f259-3f17-4a94-bb76-4af59fe9aae0', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', 'Nienhuis Montessori USA', 'Sales Team', 'sales@nienhuis.com', '+1-800-555-0400', NULL, 'https://www.nienhuis.com', NULL, true, '2026-09-03 15:18:16.686', '2026-09-03 15:18:16.686', NULL);


ALTER TABLE public."Supplier" ENABLE TRIGGER ALL;

--
-- Data for Name: InventoryItem; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public."InventoryItem" DISABLE TRIGGER ALL;

INSERT INTO public."InventoryItem" (id, "organizationId", "categoryId", "supplierId", "materialId", name, description, sku, unit, "currentStock", "minimumStock", "reorderPoint", "unitCost", location, "inClassroomUse", "replacementDue", "imageUrl", "isActive", "createdAt", "updatedAt", "deletedAt") VALUES ('390c39c0-43de-483f-98a6-7787b3aff0c4', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', 'ebe12c04-70e9-4e8f-8cd5-e68a8d19dbaa', '5f98f259-3f17-4a94-bb76-4af59fe9aae0', 'cdaebcd6-4da4-45b7-b86d-96049f70ce32', 'Pink Tower — 10 Cubes Set', NULL, 'NM-PT-001', 'unit', 3, 2, 3, 189.00, 'Sunflower Room, Shelf A', true, NULL, NULL, true, '2026-09-03 15:18:16.703', '2026-09-03 15:18:16.703', NULL);
INSERT INTO public."InventoryItem" (id, "organizationId", "categoryId", "supplierId", "materialId", name, description, sku, unit, "currentStock", "minimumStock", "reorderPoint", "unitCost", location, "inClassroomUse", "replacementDue", "imageUrl", "isActive", "createdAt", "updatedAt", "deletedAt") VALUES ('2f9f4d2f-997d-42a8-88dc-03d85452ce5f', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', 'ebe12c04-70e9-4e8f-8cd5-e68a8d19dbaa', '5f98f259-3f17-4a94-bb76-4af59fe9aae0', 'c5860d71-a3b4-46f1-809f-01a8646887db', 'Sandpaper Letters — Lowercase Set', NULL, 'NM-SL-002', 'unit', 1, 5, 8, 129.00, 'Sunflower Room, Shelf B', true, '2026-10-03 15:18:16.727', NULL, true, '2026-09-03 15:18:16.729', '2026-09-03 15:18:16.729', NULL);


ALTER TABLE public."InventoryItem" ENABLE TRIGGER ALL;

--
-- Data for Name: Invitation; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public."Invitation" DISABLE TRIGGER ALL;



ALTER TABLE public."Invitation" ENABLE TRIGGER ALL;

--
-- Data for Name: Invoice; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public."Invoice" DISABLE TRIGGER ALL;

INSERT INTO public."Invoice" (id, "organizationId", "studentId", "enrollmentId", "academicYearId", "invoiceNumber", "issueDate", "dueDate", "totalAmount", "paidAmount", currency, status, notes, "createdAt", "updatedAt", "deletedAt") VALUES ('8eb70c4a-5533-4424-8954-b8e381932183', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', 'fa74d8a5-499c-48f3-9eff-a8e304531d8c', '6b6e8ebd-67e6-4936-9191-a5c12420d3c6', '525ab945-600e-4bda-9693-f5d4a740ab2d', 'INV-2026-001', '2026-08-04 15:18:16.599', '2026-08-19 15:18:16.599', 1200.00, 1200.00, 'USD', 'PAID', NULL, '2026-09-03 15:18:16.601', '2026-09-03 15:18:16.601', NULL);
INSERT INTO public."Invoice" (id, "organizationId", "studentId", "enrollmentId", "academicYearId", "invoiceNumber", "issueDate", "dueDate", "totalAmount", "paidAmount", currency, status, notes, "createdAt", "updatedAt", "deletedAt") VALUES ('7194efb6-b7db-4495-97ea-feab925a834c', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', '218e90cd-6b1e-4214-b8d1-d0813883ee1e', 'd7df48e8-53b7-414f-a0ce-bb1fc8bf8b46', '525ab945-600e-4bda-9693-f5d4a740ab2d', 'INV-2026-002', '2026-07-20 15:18:16.639', '2026-08-19 15:18:16.639', 1550.00, 1550.00, 'USD', 'PAID', 'Second reminder sent. Please contact parent Carlos Rivera.', '2026-09-03 15:18:16.64', '2026-09-04 17:21:48.696', NULL);


ALTER TABLE public."Invoice" ENABLE TRIGGER ALL;

--
-- Data for Name: InvoiceLineItem; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public."InvoiceLineItem" DISABLE TRIGGER ALL;

INSERT INTO public."InvoiceLineItem" (id, "invoiceId", "feeStructureId", description, quantity, "unitPrice", "totalPrice", "createdAt") VALUES ('c47dc7a3-d5c6-4cba-b12a-1707a5951184', '8eb70c4a-5533-4424-8954-b8e381932183', '78f19c00-5f1c-4889-bf5d-b6451e6e96a3', 'Monthly Tuition — September 2024', 1, 1200.00, 1200.00, '2026-09-03 15:18:16.61');
INSERT INTO public."InvoiceLineItem" (id, "invoiceId", "feeStructureId", description, quantity, "unitPrice", "totalPrice", "createdAt") VALUES ('0a4809ae-f412-4c12-a007-e708b65e9ba3', '7194efb6-b7db-4495-97ea-feab925a834c', '78f19c00-5f1c-4889-bf5d-b6451e6e96a3', 'Monthly Tuition — October 2024', 1, 1200.00, 1200.00, '2026-09-03 15:18:16.646');
INSERT INTO public."InvoiceLineItem" (id, "invoiceId", "feeStructureId", description, quantity, "unitPrice", "totalPrice", "createdAt") VALUES ('effde89e-c1d1-4054-a2af-a1a4d6c9b142', '7194efb6-b7db-4495-97ea-feab925a834c', '5f08f0c3-f2d8-4c2e-85fb-aa169c99c7c1', 'Annual Registration Fee 2024–2025', 1, 350.00, 350.00, '2026-09-03 15:18:16.646');


ALTER TABLE public."InvoiceLineItem" ENABLE TRIGGER ALL;

--
-- Data for Name: Leaderboard; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public."Leaderboard" DISABLE TRIGGER ALL;

INSERT INTO public."Leaderboard" (id, "classroomId", period, "periodKey", "createdAt", "updatedAt") VALUES ('6378b172-ff43-43d2-906c-7fcf161c2cda', '417ddb2d-d8bc-4a2e-ba52-a9717de57923', 'WEEKLY', '2026-W01', '2026-09-03 15:18:16.837', '2026-09-03 15:18:16.837');


ALTER TABLE public."Leaderboard" ENABLE TRIGGER ALL;

--
-- Data for Name: LeaderboardEntry; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public."LeaderboardEntry" DISABLE TRIGGER ALL;

INSERT INTO public."LeaderboardEntry" (id, "leaderboardId", "studentId", points, rank, "updatedAt") VALUES ('1ae11f40-80c3-4c56-ba19-e939fa9cb125', '6378b172-ff43-43d2-906c-7fcf161c2cda', 'fa74d8a5-499c-48f3-9eff-a8e304531d8c', 35, 1, '2026-09-03 15:18:16.851');
INSERT INTO public."LeaderboardEntry" (id, "leaderboardId", "studentId", points, rank, "updatedAt") VALUES ('0fccab1b-3311-4ba9-9644-f47cd0a07aa9', '6378b172-ff43-43d2-906c-7fcf161c2cda', '218e90cd-6b1e-4214-b8d1-d0813883ee1e', 22, 2, '2026-09-03 15:18:16.869');


ALTER TABLE public."LeaderboardEntry" ENABLE TRIGGER ALL;

--
-- Data for Name: LeaveRequest; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public."LeaveRequest" DISABLE TRIGGER ALL;

INSERT INTO public."LeaveRequest" (id, "organizationId", "staffId", "leaveType", "startDate", "endDate", "totalDays", reason, status, "approvedByUserId", "approvedAt", "rejectionReason", "createdAt", "updatedAt") VALUES ('4efe5c6a-a247-472f-b86f-1591df565824', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', '5867f2a0-dab4-47db-8046-3c20d310ca8d', 'ANNUAL', '2026-08-14 15:18:14.901', '2026-08-18 15:18:14.901', 5, 'Family vacation', 'APPROVED', '6d5c28e3-25ea-433d-96f7-fc2a2e5b6b8a', '2026-08-09 15:18:14.901', NULL, '2026-09-03 15:18:14.903', '2026-09-03 15:18:14.903');
INSERT INTO public."LeaveRequest" (id, "organizationId", "staffId", "leaveType", "startDate", "endDate", "totalDays", reason, status, "approvedByUserId", "approvedAt", "rejectionReason", "createdAt", "updatedAt") VALUES ('8671ac1a-b912-4d51-a708-44619634a2eb', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', '5867f2a0-dab4-47db-8046-3c20d310ca8d', 'SICK', '2026-09-06 15:18:14.937', '2026-09-08 15:18:14.937', 3, 'Medical procedure', 'PENDING', NULL, NULL, NULL, '2026-09-03 15:18:14.939', '2026-09-03 15:18:14.939');


ALTER TABLE public."LeaveRequest" ENABLE TRIGGER ALL;

--
-- Data for Name: Ledger; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public."Ledger" DISABLE TRIGGER ALL;

INSERT INTO public."Ledger" (id, "organizationId", type, amount, currency, description, "referenceType", "referenceId", "runningBalance", "createdAt") VALUES ('6994d446-d3d0-4dc5-b8d4-a2dc5f40fb8e', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', 'CREDIT', 1550.00, 'USD', 'Payment for invoice INV-2026-002', 'Payment', '64b5ab4a-e2af-4d5d-b842-aeb87281dd3e', -1550.00, '2026-09-04 17:21:48.715');


ALTER TABLE public."Ledger" ENABLE TRIGGER ALL;

--
-- Data for Name: Milestone; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public."Milestone" DISABLE TRIGGER ALL;

INSERT INTO public."Milestone" (id, "curriculumAreaId", title, description, "ageGroupMin", "ageGroupMax", "sortOrder", "isActive", "createdAt", "updatedAt") VALUES ('e5bb87c4-6e1f-4e3b-abeb-28eb06d2a721', '410af4f9-f133-4f31-91b2-95d8491a446d', 'Pouring (water, dry)', NULL, 2.5, 3.5, 1, true, '2026-09-03 15:18:15.733', '2026-09-03 15:18:15.733');
INSERT INTO public."Milestone" (id, "curriculumAreaId", title, description, "ageGroupMin", "ageGroupMax", "sortOrder", "isActive", "createdAt", "updatedAt") VALUES ('27280d19-659d-4746-bb91-43e4b369b999', '410af4f9-f133-4f31-91b2-95d8491a446d', 'Dressing frames (button, zipper)', NULL, 3, 4.5, 2, true, '2026-09-03 15:18:15.746', '2026-09-03 15:18:15.746');
INSERT INTO public."Milestone" (id, "curriculumAreaId", title, description, "ageGroupMin", "ageGroupMax", "sortOrder", "isActive", "createdAt", "updatedAt") VALUES ('97bf9699-3044-4123-84e7-5c89b5b6a6f7', '410af4f9-f133-4f31-91b2-95d8491a446d', 'Table scrubbing', NULL, 3.5, 5, 3, true, '2026-09-03 15:18:15.76', '2026-09-03 15:18:15.76');
INSERT INTO public."Milestone" (id, "curriculumAreaId", title, description, "ageGroupMin", "ageGroupMax", "sortOrder", "isActive", "createdAt", "updatedAt") VALUES ('8c2dc39b-f07a-461f-a8b6-d5f03a6d291f', 'b4adb2c3-1e9c-41ef-bc93-64cb32a602ca', 'Pink Tower — 10-cube series', NULL, 2.5, 4, 1, true, '2026-09-03 15:18:15.767', '2026-09-03 15:18:15.767');
INSERT INTO public."Milestone" (id, "curriculumAreaId", title, description, "ageGroupMin", "ageGroupMax", "sortOrder", "isActive", "createdAt", "updatedAt") VALUES ('3b2c4e30-51d1-48ee-993e-8064dbaf1345', 'b4adb2c3-1e9c-41ef-bc93-64cb32a602ca', 'Color tablets — box 2', NULL, 3, 4.5, 2, true, '2026-09-03 15:18:15.788', '2026-09-03 15:18:15.788');
INSERT INTO public."Milestone" (id, "curriculumAreaId", title, description, "ageGroupMin", "ageGroupMax", "sortOrder", "isActive", "createdAt", "updatedAt") VALUES ('8eeb6409-9da4-4c31-aa3f-21fdd43b2258', 'b4adb2c3-1e9c-41ef-bc93-64cb32a602ca', 'Binomial cube', NULL, 4.5, 6, 3, true, '2026-09-03 15:18:15.804', '2026-09-03 15:18:15.804');
INSERT INTO public."Milestone" (id, "curriculumAreaId", title, description, "ageGroupMin", "ageGroupMax", "sortOrder", "isActive", "createdAt", "updatedAt") VALUES ('7548d2d4-99e3-44c9-a99d-d1f9266ec6f0', '27220259-7054-4a57-835f-45e49c95828b', 'Sandpaper letters (lowercase)', NULL, 3, 4.5, 1, true, '2026-09-03 15:18:15.817', '2026-09-03 15:18:15.817');
INSERT INTO public."Milestone" (id, "curriculumAreaId", title, description, "ageGroupMin", "ageGroupMax", "sortOrder", "isActive", "createdAt", "updatedAt") VALUES ('5f8d6d02-9165-4915-b99b-0c1865b01005', '27220259-7054-4a57-835f-45e49c95828b', 'Moveable alphabet — CVC words', NULL, 4, 5.5, 2, true, '2026-09-03 15:18:15.827', '2026-09-03 15:18:15.827');
INSERT INTO public."Milestone" (id, "curriculumAreaId", title, description, "ageGroupMin", "ageGroupMax", "sortOrder", "isActive", "createdAt", "updatedAt") VALUES ('d1d96d32-2341-44a8-bec3-e64a08228dba', '27220259-7054-4a57-835f-45e49c95828b', 'First reading — three-letter CVC', NULL, 4.5, 6, 3, true, '2026-09-03 15:18:15.838', '2026-09-03 15:18:15.838');
INSERT INTO public."Milestone" (id, "curriculumAreaId", title, description, "ageGroupMin", "ageGroupMax", "sortOrder", "isActive", "createdAt", "updatedAt") VALUES ('4a5a75b2-3e56-4fdf-a7ef-14a520fe0578', '52924826-916b-4fe1-815e-e09cc3402766', 'Number rods & cards', NULL, 3.5, 5, 1, true, '2026-09-03 15:18:15.844', '2026-09-03 15:18:15.844');
INSERT INTO public."Milestone" (id, "curriculumAreaId", title, description, "ageGroupMin", "ageGroupMax", "sortOrder", "isActive", "createdAt", "updatedAt") VALUES ('401f511f-d4af-46eb-9a03-c13520fd0696', '52924826-916b-4fe1-815e-e09cc3402766', 'Spindle boxes', NULL, 4, 5, 2, true, '2026-09-03 15:18:15.854', '2026-09-03 15:18:15.854');
INSERT INTO public."Milestone" (id, "curriculumAreaId", title, description, "ageGroupMin", "ageGroupMax", "sortOrder", "isActive", "createdAt", "updatedAt") VALUES ('3f7530e9-d722-4dd6-be4e-8ab2e45e9d3c', '52924826-916b-4fe1-815e-e09cc3402766', 'Golden beads — decimal system', NULL, 4.5, 6, 3, true, '2026-09-03 15:18:15.861', '2026-09-03 15:18:15.861');


ALTER TABLE public."Milestone" ENABLE TRIGGER ALL;

--
-- Data for Name: LessonPlan; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public."LessonPlan" DISABLE TRIGGER ALL;

INSERT INTO public."LessonPlan" (id, "organizationId", "classroomId", "academicYearId", "curriculumAreaId", "createdByStaffId", title, objectives, instructions, notes, "ageGroupMin", "ageGroupMax", "scheduledDate", "durationMinutes", status, "createdAt", "updatedAt", "deletedAt", "milestoneId") VALUES ('9495a0c4-d765-4313-a0e3-72306cb8f5e3', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', '417ddb2d-d8bc-4a2e-ba52-a9717de57923', '525ab945-600e-4bda-9693-f5d4a740ab2d', '410af4f9-f133-4f31-91b2-95d8491a446d', '5867f2a0-dab4-47db-8046-3c20d310ca8d', 'Introduction to Pouring', 'Develop hand-eye coordination and concentration through precise liquid transfer.', '1. Prepare two identical pitchers half-full of water.
2. Demonstrate slow, deliberate pouring.
3. Invite child to try.
4. Clean up spills together as part of the lesson.', 'Use blue-tinted water for visual clarity.', 3, 4.5, '2026-09-05 15:18:16.183', 20, 'PUBLISHED', '2026-09-03 15:18:16.185', '2026-09-03 15:18:16.185', NULL, NULL);
INSERT INTO public."LessonPlan" (id, "organizationId", "classroomId", "academicYearId", "curriculumAreaId", "createdByStaffId", title, objectives, instructions, notes, "ageGroupMin", "ageGroupMax", "scheduledDate", "durationMinutes", status, "createdAt", "updatedAt", "deletedAt", "milestoneId") VALUES ('d158e10f-d207-4930-9467-fb4e57566fda', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', '1f21a384-da6c-4753-809a-6fded2b2853e', '525ab945-600e-4bda-9693-f5d4a740ab2d', '03421643-600a-42ba-8e80-c84cc7e5f0ec', '5867f2a0-dab4-47db-8046-3c20d310ca8d', 'Introduction to the Pink Tower', 'Develop visual discrimination of dimensions.', '1. Lay out rug.
2. Carry cubes one by one starting from smallest.
3. Build tower centered.
4. Dismantle and return.', 'Ensure child handles one block at a time to build motor skills.', 2.5, 3.5, '2026-09-04 01:48:34.368', 15, 'PUBLISHED', '2026-09-04 01:48:34.375', '2026-09-04 01:48:34.375', NULL, NULL);
INSERT INTO public."LessonPlan" (id, "organizationId", "classroomId", "academicYearId", "curriculumAreaId", "createdByStaffId", title, objectives, instructions, notes, "ageGroupMin", "ageGroupMax", "scheduledDate", "durationMinutes", status, "createdAt", "updatedAt", "deletedAt", "milestoneId") VALUES ('49a48066-17f0-410d-b0f0-1f5a51e6e676', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', '1f21a384-da6c-4753-809a-6fded2b2853e', '525ab945-600e-4bda-9693-f5d4a740ab2d', '42726bad-7c9e-4511-85ec-55cfda05be93', '5867f2a0-dab4-47db-8046-3c20d310ca8d', 'Sandpaper Letters: a, c, m', 'Introduce phonetic sounds and letter tracing.', '1. Trace letter with index and middle finger.
2. Make phonetic sound.
3. Have child trace and repeat sound.', 'Watch for correct directionality when tracing.', 3, 4.5, '2026-09-04 01:48:34.403', 20, 'PUBLISHED', '2026-09-04 01:48:34.41', '2026-09-04 01:48:34.41', NULL, NULL);
INSERT INTO public."LessonPlan" (id, "organizationId", "classroomId", "academicYearId", "curriculumAreaId", "createdByStaffId", title, objectives, instructions, notes, "ageGroupMin", "ageGroupMax", "scheduledDate", "durationMinutes", status, "createdAt", "updatedAt", "deletedAt", "milestoneId") VALUES ('129e1d36-2fee-4016-b467-d3ef5c66431a', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', '1f21a384-da6c-4753-809a-6fded2b2853e', '525ab945-600e-4bda-9693-f5d4a740ab2d', '52924826-916b-4fe1-815e-e09cc3402766', '5867f2a0-dab4-47db-8046-3c20d310ca8d', 'Number Rods Introduction', 'Learn names of numbers 1-10 and understand quantity.', '1. Carry rods to mat.
2. Order from shortest to longest.
3. Count segments on each rod out loud.', 'Reinforce that the final count is the name of the rod.', 4, 5.5, '2026-09-04 01:48:34.415', 25, 'PUBLISHED', '2026-09-04 01:48:34.421', '2026-09-04 01:48:34.421', NULL, NULL);
INSERT INTO public."LessonPlan" (id, "organizationId", "classroomId", "academicYearId", "curriculumAreaId", "createdByStaffId", title, objectives, instructions, notes, "ageGroupMin", "ageGroupMax", "scheduledDate", "durationMinutes", status, "createdAt", "updatedAt", "deletedAt", "milestoneId") VALUES ('95ecd96c-079b-4373-92f2-8c21e892eaed', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', '1f21a384-da6c-4753-809a-6fded2b2853e', '525ab945-600e-4bda-9693-f5d4a740ab2d', '52924826-916b-4fe1-815e-e09cc3402766', '5867f2a0-dab4-47db-8046-3c20d310ca8d', 'Spindle Box', 'Understand the concept of zero and associate quantities with symbols.', '1. Point to number symbol.
2. Count out corresponding spindles.
3. Place in compartment.
4. Note the zero compartment is empty.', 'Emphasize that zero means nothing.', 4, 5, '2026-09-04 01:48:34.425', 20, 'PUBLISHED', '2026-09-04 01:48:34.43', '2026-09-04 01:48:34.43', NULL, NULL);
INSERT INTO public."LessonPlan" (id, "organizationId", "classroomId", "academicYearId", "curriculumAreaId", "createdByStaffId", title, objectives, instructions, notes, "ageGroupMin", "ageGroupMax", "scheduledDate", "durationMinutes", status, "createdAt", "updatedAt", "deletedAt", "milestoneId") VALUES ('78bc2c34-8853-419e-a28c-8de7b6297ed0', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', '1f21a384-da6c-4753-809a-6fded2b2853e', '525ab945-600e-4bda-9693-f5d4a740ab2d', '68d12126-3295-472e-94ee-3c6ac5be89ce', '5867f2a0-dab4-47db-8046-3c20d310ca8d', 'Land and Water Form Trays', 'Identify geographic landforms visually and tactilely.', '1. Pour colored water into tray.
2. Trace the landform (e.g. island, lake).
3. Use terminology.', 'Use a sponge for cleanup.', 3.5, 6, '2026-09-04 01:48:34.434', 30, 'PUBLISHED', '2026-09-04 01:48:34.44', '2026-09-04 01:48:34.44', NULL, NULL);
INSERT INTO public."LessonPlan" (id, "organizationId", "classroomId", "academicYearId", "curriculumAreaId", "createdByStaffId", title, objectives, instructions, notes, "ageGroupMin", "ageGroupMax", "scheduledDate", "durationMinutes", status, "createdAt", "updatedAt", "deletedAt", "milestoneId") VALUES ('35495b37-15f9-4b79-89f9-6fda5d6d063a', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', '1f21a384-da6c-4753-809a-6fded2b2853e', '525ab945-600e-4bda-9693-f5d4a740ab2d', '0a8e1f0b-7572-4b48-97bd-40a251d467c3', '368491d5-3b52-4217-84fa-c162eebafd6b', 'tetsing', 'tetsing', '', NULL, NULL, NULL, '2026-09-05 00:00:00', 30, 'PUBLISHED', '2026-09-04 15:33:10.296', '2026-09-04 15:33:10.296', NULL, NULL);


ALTER TABLE public."LessonPlan" ENABLE TRIGGER ALL;

--
-- Data for Name: LessonPlanMaterial; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public."LessonPlanMaterial" DISABLE TRIGGER ALL;

INSERT INTO public."LessonPlanMaterial" (id, "lessonPlanId", "materialId", quantity) VALUES ('5aba30ab-d6b1-4624-bf59-3cd587c50ef1', '9495a0c4-d765-4313-a0e3-72306cb8f5e3', 'cdaebcd6-4da4-45b7-b86d-96049f70ce32', 2);


ALTER TABLE public."LessonPlanMaterial" ENABLE TRIGGER ALL;

--
-- Data for Name: MedicalInfo; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public."MedicalInfo" DISABLE TRIGGER ALL;

INSERT INTO public."MedicalInfo" (id, "studentId", allergies, conditions, medications, "doctorName", "doctorPhone", "insuranceInfo", notes, "updatedAt", "createdAt") VALUES ('1c7d31f5-2c7e-4ab3-9984-80fca41f0dac', 'fa74d8a5-499c-48f3-9eff-a8e304531d8c', '{Peanuts,"Tree nuts"}', '{"Mild asthma"}', 'Salbutamol inhaler (as needed)', 'Dr. Patricia Moore', '+1-555-0200', NULL, NULL, '2026-09-03 15:18:16.024', '2026-09-03 15:18:16.024');


ALTER TABLE public."MedicalInfo" ENABLE TRIGGER ALL;

--
-- Data for Name: Message; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public."Message" DISABLE TRIGGER ALL;

INSERT INTO public."Message" (id, "senderId", "recipientId", subject, body, "mediaUrls", status, "readAt", "createdAt", "updatedAt", "deletedAt") VALUES ('badd0ced-3f83-4780-8e00-78b785bedd1b', '83407454-d11d-4026-a86d-064a3e45f933', '74f06c0a-b838-4549-8b86-6a6d386ff69f', 'Peanut allergy reminder for Alex', 'Hi Sarah, a gentle reminder that Alex has a severe peanut and tree nut allergy. Please ensure no nut products are present during snack time. Thank you!', '{}', 'READ', '2026-09-02 15:18:16.891', '2026-09-03 15:18:16.892', '2026-09-03 15:18:16.892', NULL);
INSERT INTO public."Message" (id, "senderId", "recipientId", subject, body, "mediaUrls", status, "readAt", "createdAt", "updatedAt", "deletedAt") VALUES ('5fb3cbd5-e4b3-4614-a13b-d0a82a2789e3', '83407454-d11d-4026-a86d-064a3e45f933', '74f06c0a-b838-4549-8b86-6a6d386ff69f', 'Testing', 'test', '{}', 'READ', '2026-09-04 03:43:00.08', '2026-09-04 03:24:55.969', '2026-09-04 03:43:00.082', NULL);
INSERT INTO public."Message" (id, "senderId", "recipientId", subject, body, "mediaUrls", status, "readAt", "createdAt", "updatedAt", "deletedAt") VALUES ('8b0091ba-bc71-4726-b8e5-ec05ec5ba76b', '83407454-d11d-4026-a86d-064a3e45f933', '74f06c0a-b838-4549-8b86-6a6d386ff69f', NULL, 'jhsdf', '{}', 'READ', '2026-09-04 03:43:00.085', '2026-09-04 03:42:46.673', '2026-09-04 03:43:00.096', NULL);
INSERT INTO public."Message" (id, "senderId", "recipientId", subject, body, "mediaUrls", status, "readAt", "createdAt", "updatedAt", "deletedAt") VALUES ('24f1dd17-dfc7-4c09-9396-b02f632931f5', '83407454-d11d-4026-a86d-064a3e45f933', '74f06c0a-b838-4549-8b86-6a6d386ff69f', 'Testing', 'tetisng message', '{}', 'READ', '2026-09-04 03:43:00.076', '2026-09-04 03:20:32.013', '2026-09-04 03:43:00.078', NULL);
INSERT INTO public."Message" (id, "senderId", "recipientId", subject, body, "mediaUrls", status, "readAt", "createdAt", "updatedAt", "deletedAt") VALUES ('e72ce40a-fe09-4ad6-921d-936763a4810a', '74f06c0a-b838-4549-8b86-6a6d386ff69f', '83407454-d11d-4026-a86d-064a3e45f933', NULL, 'hellllo', '{}', 'READ', '2026-09-04 03:44:30.232', '2026-09-04 03:43:10.272', '2026-09-04 03:44:30.234', NULL);


ALTER TABLE public."Message" ENABLE TRIGGER ALL;

--
-- Data for Name: Notification; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public."Notification" DISABLE TRIGGER ALL;

INSERT INTO public."Notification" (id, "organizationId", "userId", type, title, body, data, "isRead", "readAt", "createdAt") VALUES ('eee833d5-7e72-479b-96d1-166d640aea38', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', 'dc75a027-8b85-46c1-9621-c7d765a819e5', 'INVOICE', 'Invoice overdue — INV-2024-002', 'Invoice #INV-2024-002 for $1,550.00 is 15 days overdue.', NULL, false, NULL, '2026-09-03 15:18:16.92');
INSERT INTO public."Notification" (id, "organizationId", "userId", type, title, body, data, "isRead", "readAt", "createdAt") VALUES ('b18998a8-3134-4c98-a35e-a8cfa93de744', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', '6d5c28e3-25ea-433d-96f7-fc2a2e5b6b8a', 'LOW_STOCK', 'Low stock: Sandpaper Letters', 'Sandpaper Letters — Lowercase Set is below minimum stock level (1 remaining, min 5).', NULL, false, NULL, '2026-09-03 15:18:16.92');
INSERT INTO public."Notification" (id, "organizationId", "userId", type, title, body, data, "isRead", "readAt", "createdAt") VALUES ('7ce3a912-5bc5-429d-961e-136c0ee381a6', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', '74f06c0a-b838-4549-8b86-6a6d386ff69f', 'MESSAGE', 'New message from Robert Johnson', 'Testing', '{"messageId": "5fb3cbd5-e4b3-4614-a13b-d0a82a2789e3"}', true, '2026-09-04 03:32:58.666', '2026-09-04 03:24:55.994');
INSERT INTO public."Notification" (id, "organizationId", "userId", type, title, body, data, "isRead", "readAt", "createdAt") VALUES ('2d7927b2-e8bd-4776-b658-df4b1c61c9d1', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', '83407454-d11d-4026-a86d-064a3e45f933', 'ATTENDANCE', 'Alex has arrived', 'Alex Johnson checked in at 8:10 AM', NULL, true, '2026-09-04 03:42:02.767', '2026-09-03 15:18:16.92');
INSERT INTO public."Notification" (id, "organizationId", "userId", type, title, body, data, "isRead", "readAt", "createdAt") VALUES ('6ee2e8a2-daee-4ac3-b00c-f0ba367628d4', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', '74f06c0a-b838-4549-8b86-6a6d386ff69f', 'MESSAGE', 'New message from Robert Johnson', 'jhsdf', '{"senderId": "83407454-d11d-4026-a86d-064a3e45f933", "messageId": "8b0091ba-bc71-4726-b8e5-ec05ec5ba76b"}', true, '2026-09-04 03:43:34.179', '2026-09-04 03:42:46.687');
INSERT INTO public."Notification" (id, "organizationId", "userId", type, title, body, data, "isRead", "readAt", "createdAt") VALUES ('6595b9cf-994a-4170-b374-b947c383e0a8', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', '83407454-d11d-4026-a86d-064a3e45f933', 'MESSAGE', 'New message from Sarah Kowalski', 'hellllo', '{"senderId": "74f06c0a-b838-4549-8b86-6a6d386ff69f", "messageId": "e72ce40a-fe09-4ad6-921d-936763a4810a"}', true, '2026-09-04 03:48:45.625', '2026-09-04 03:43:10.281');
INSERT INTO public."Notification" (id, "organizationId", "userId", type, title, body, data, "isRead", "readAt", "createdAt") VALUES ('619b4e8d-8d43-468e-a62b-04d36f41f905', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', '74f06c0a-b838-4549-8b86-6a6d386ff69f', 'MESSAGE', 'New message from Robert Johnson', 'Testing', '{"messageId": "24f1dd17-dfc7-4c09-9396-b02f632931f5"}', true, '2026-09-04 04:24:15.251', '2026-09-04 03:20:32.074');


ALTER TABLE public."Notification" ENABLE TRIGGER ALL;

--
-- Data for Name: NotificationPreference; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public."NotificationPreference" DISABLE TRIGGER ALL;



ALTER TABLE public."NotificationPreference" ENABLE TRIGGER ALL;

--
-- Data for Name: Observation; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public."Observation" DISABLE TRIGGER ALL;

INSERT INTO public."Observation" (id, "organizationId", "studentId", "staffId", "curriculumAreaId", "milestoneId", note, "mediaUrls", "masteryLevel", "observedAt", "createdAt", "updatedAt", "deletedAt", "aiSuggestedAreaId", "aiConfidenceScore") VALUES ('8f88d349-55b8-4cf1-850a-fde407f4a81b', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', 'fa74d8a5-499c-48f3-9eff-a8e304531d8c', '5867f2a0-dab4-47db-8046-3c20d310ca8d', '410af4f9-f133-4f31-91b2-95d8491a446d', 'e5bb87c4-6e1f-4e3b-abeb-28eb06d2a721', 'Alex independently completed the full pouring cycle without spilling. Showed excellent concentration for over 8 minutes.', '{}', 'MASTERED', '2026-08-31 15:18:16.234', '2026-09-03 15:18:16.235', '2026-09-03 15:18:16.235', NULL, NULL, NULL);
INSERT INTO public."Observation" (id, "organizationId", "studentId", "staffId", "curriculumAreaId", "milestoneId", note, "mediaUrls", "masteryLevel", "observedAt", "createdAt", "updatedAt", "deletedAt", "aiSuggestedAreaId", "aiConfidenceScore") VALUES ('5d4fda4a-e814-4cc8-af3e-a43d6e997e01', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', 'fa74d8a5-499c-48f3-9eff-a8e304531d8c', '5867f2a0-dab4-47db-8046-3c20d310ca8d', 'b4adb2c3-1e9c-41ef-bc93-64cb32a602ca', '8c2dc39b-f07a-461f-a8b6-d5f03a6d291f', 'Worked with Pink Tower — placed cubes correctly but occasionally needed prompting for the largest cube.', '{}', 'PRACTICING', '2026-08-27 15:18:16.249', '2026-09-03 15:18:16.251', '2026-09-03 15:18:16.251', NULL, NULL, NULL);
INSERT INTO public."Observation" (id, "organizationId", "studentId", "staffId", "curriculumAreaId", "milestoneId", note, "mediaUrls", "masteryLevel", "observedAt", "createdAt", "updatedAt", "deletedAt", "aiSuggestedAreaId", "aiConfidenceScore") VALUES ('eb8ffcf2-de4e-4129-8337-2b91ce0dec28', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', 'fa74d8a5-499c-48f3-9eff-a8e304531d8c', '5867f2a0-dab4-47db-8046-3c20d310ca8d', '27220259-7054-4a57-835f-45e49c95828b', '7548d2d4-99e3-44c9-a99d-d1f9266ec6f0', 'Introduced sandpaper letters a, m, s. Alex traced all three and verbalized sounds correctly.', '{}', 'INTRODUCED', '2026-08-24 15:18:16.256', '2026-09-03 15:18:16.257', '2026-09-03 15:18:16.257', NULL, NULL, NULL);
INSERT INTO public."Observation" (id, "organizationId", "studentId", "staffId", "curriculumAreaId", "milestoneId", note, "mediaUrls", "masteryLevel", "observedAt", "createdAt", "updatedAt", "deletedAt", "aiSuggestedAreaId", "aiConfidenceScore") VALUES ('bfacd07d-b1e0-4e2d-bd7f-7699848f2ca3', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', '218e90cd-6b1e-4214-b8d1-d0813883ee1e', '5867f2a0-dab4-47db-8046-3c20d310ca8d', '410af4f9-f133-4f31-91b2-95d8491a446d', 'e5bb87c4-6e1f-4e3b-abeb-28eb06d2a721', 'Sofia is still learning to grip the pitcher with two hands. Will repeat presentation next session.', '{}', 'PRACTICING', '2026-09-01 15:18:16.277', '2026-09-03 15:18:16.281', '2026-09-03 15:18:16.281', NULL, NULL, NULL);
INSERT INTO public."Observation" (id, "organizationId", "studentId", "staffId", "curriculumAreaId", "milestoneId", note, "mediaUrls", "masteryLevel", "observedAt", "createdAt", "updatedAt", "deletedAt", "aiSuggestedAreaId", "aiConfidenceScore") VALUES ('d0db9fe2-81e0-445d-8faa-d1f1854b1930', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', '218e90cd-6b1e-4214-b8d1-d0813883ee1e', '5867f2a0-dab4-47db-8046-3c20d310ca8d', '52924826-916b-4fe1-815e-e09cc3402766', '4a5a75b2-3e56-4fdf-a7ef-14a520fe0578', 'Counted rods 1–5 accurately and matched quantity to number symbol.', '{}', 'PRACTICING', '2026-08-29 15:18:16.289', '2026-09-03 15:18:16.29', '2026-09-03 15:18:16.29', NULL, NULL, NULL);
INSERT INTO public."Observation" (id, "organizationId", "studentId", "staffId", "curriculumAreaId", "milestoneId", note, "mediaUrls", "masteryLevel", "observedAt", "createdAt", "updatedAt", "deletedAt", "aiSuggestedAreaId", "aiConfidenceScore") VALUES ('2ee8aef8-59ae-4548-acc5-47794e4b649d', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', '7c968eac-81f5-44ba-bb7b-08664d16f1a9', '5867f2a0-dab4-47db-8046-3c20d310ca8d', '52924826-916b-4fe1-815e-e09cc3402766', '4a5a75b2-3e56-4fdf-a7ef-14a520fe0578', 'Liam independently assembled the golden bead 1000 cube. Exceptional focus and precision.', '{}', 'EXTENDING', '2026-09-02 15:18:16.294', '2026-09-03 15:18:16.297', '2026-09-03 15:18:16.297', NULL, NULL, NULL);


ALTER TABLE public."Observation" ENABLE TRIGGER ALL;

--
-- Data for Name: PaymentMethod; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public."PaymentMethod" DISABLE TRIGGER ALL;



ALTER TABLE public."PaymentMethod" ENABLE TRIGGER ALL;

--
-- Data for Name: Payment; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public."Payment" DISABLE TRIGGER ALL;

INSERT INTO public."Payment" (id, "organizationId", "invoiceId", "paymentMethodId", amount, currency, status, "referenceNumber", "receiptUrl", notes, "paidAt", "createdAt", "updatedAt") VALUES ('734fb664-a4d1-4782-b703-dc3c66ece9a5', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', '8eb70c4a-5533-4424-8954-b8e381932183', NULL, 1200.00, 'USD', 'COMPLETED', 'TXN-20240915-001', NULL, NULL, '2026-08-20 15:18:16.619', '2026-09-03 15:18:16.62', '2026-09-03 15:18:16.62');
INSERT INTO public."Payment" (id, "organizationId", "invoiceId", "paymentMethodId", amount, currency, status, "referenceNumber", "receiptUrl", notes, "paidAt", "createdAt", "updatedAt") VALUES ('64b5ab4a-e2af-4d5d-b842-aeb87281dd3e', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', '7194efb6-b7db-4495-97ea-feab925a834c', NULL, 1550.00, 'USD', 'COMPLETED', NULL, NULL, NULL, '2026-09-04 17:21:48.664', '2026-09-04 17:21:48.665', '2026-09-04 17:21:48.665');


ALTER TABLE public."Payment" ENABLE TRIGGER ALL;

--
-- Data for Name: Payroll; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public."Payroll" DISABLE TRIGGER ALL;

INSERT INTO public."Payroll" (id, "organizationId", "staffId", month, year, "baseSalary", allowances, deductions, "netPay", currency, status, "processedAt", notes, "createdAt", "updatedAt") VALUES ('805e552f-c0de-40fb-a399-417594a7e74e', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', '5867f2a0-dab4-47db-8046-3c20d310ca8d', 10, 2026, 4583.33, 200.00, 550.00, 4233.33, 'USD', 'PAID', '2026-10-31 00:00:00', NULL, '2026-09-03 15:18:14.951', '2026-09-03 15:18:14.951');
INSERT INTO public."Payroll" (id, "organizationId", "staffId", month, year, "baseSalary", allowances, deductions, "netPay", currency, status, "processedAt", notes, "createdAt", "updatedAt") VALUES ('5c6bdd1a-f9e3-4b8e-a390-ee7aa9c1af21', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', '5867f2a0-dab4-47db-8046-3c20d310ca8d', 9, 2026, 55000.00, 0.00, 0.00, 55000.00, 'USD', 'PROCESSED', '2026-09-05 03:28:42.664', '', '2026-09-05 03:28:42.667', '2026-09-05 03:28:42.667');


ALTER TABLE public."Payroll" ENABLE TRIGGER ALL;

--
-- Data for Name: Permission; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public."Permission" DISABLE TRIGGER ALL;

INSERT INTO public."Permission" (id, key, module, action, description, "createdAt") VALUES ('d865ab8a-055a-4b17-ba60-8ee3eef953ee', 'student:read', 'students', 'read', 'View student profiles', '2026-09-03 15:18:11.701');
INSERT INTO public."Permission" (id, key, module, action, description, "createdAt") VALUES ('9b21fb56-e244-481a-854d-905f5d8e8458', 'student:write', 'students', 'write', 'Create/edit students', '2026-09-03 15:18:11.734');
INSERT INTO public."Permission" (id, key, module, action, description, "createdAt") VALUES ('a046a34c-5095-4f05-acdd-948acd710d20', 'student:delete', 'students', 'delete', 'Delete students', '2026-09-03 15:18:11.751');
INSERT INTO public."Permission" (id, key, module, action, description, "createdAt") VALUES ('75206990-d580-45b0-8301-a254fe44af30', 'attendance:read', 'attendance', 'read', 'View attendance records', '2026-09-03 15:18:11.767');
INSERT INTO public."Permission" (id, key, module, action, description, "createdAt") VALUES ('6cbda140-dd98-473f-a4ac-0567d5c90149', 'attendance:mark', 'attendance', 'mark', 'Mark attendance', '2026-09-03 15:18:11.772');
INSERT INTO public."Permission" (id, key, module, action, description, "createdAt") VALUES ('dfc018d9-18d5-4bca-9015-0b73b7f6d650', 'curriculum:read', 'curriculum', 'read', 'View curriculum', '2026-09-03 15:18:11.778');
INSERT INTO public."Permission" (id, key, module, action, description, "createdAt") VALUES ('baf6c9af-2396-4147-9f13-c2dbc67d2ac7', 'curriculum:write', 'curriculum', 'write', 'Create/edit curriculum', '2026-09-03 15:18:11.785');
INSERT INTO public."Permission" (id, key, module, action, description, "createdAt") VALUES ('45cf1e37-4652-4f5d-8a9a-5922acd2a933', 'observation:read', 'observations', 'read', 'View observations', '2026-09-03 15:18:11.791');
INSERT INTO public."Permission" (id, key, module, action, description, "createdAt") VALUES ('f787486b-3a41-4004-beca-af8b1b0d582f', 'observation:write', 'observations', 'write', 'Log observations', '2026-09-03 15:18:11.799');
INSERT INTO public."Permission" (id, key, module, action, description, "createdAt") VALUES ('e569980d-43df-4cdc-a364-065d20ce3ba5', 'finance:read', 'finance', 'read', 'View financial data', '2026-09-03 15:18:11.805');
INSERT INTO public."Permission" (id, key, module, action, description, "createdAt") VALUES ('6e582f86-2245-4027-81d4-9da606319221', 'finance:write', 'finance', 'write', 'Create invoices/payments', '2026-09-03 15:18:11.81');
INSERT INTO public."Permission" (id, key, module, action, description, "createdAt") VALUES ('55e783d9-ff18-4dc1-baa6-76ccd49c67cd', 'finance:delete', 'finance', 'delete', 'Delete finance records', '2026-09-03 15:18:11.818');
INSERT INTO public."Permission" (id, key, module, action, description, "createdAt") VALUES ('22148bed-7fd5-45f5-81da-f5bc975ea5c3', 'hr:read', 'hr', 'read', 'View HR data', '2026-09-03 15:18:11.822');
INSERT INTO public."Permission" (id, key, module, action, description, "createdAt") VALUES ('9b087187-6d43-4947-870e-7aadf3118cf3', 'hr:write', 'hr', 'write', 'Manage HR records', '2026-09-03 15:18:11.827');
INSERT INTO public."Permission" (id, key, module, action, description, "createdAt") VALUES ('88de0ba1-43bb-4876-938c-12d8f3e56f71', 'inventory:read', 'inventory', 'read', 'View inventory', '2026-09-03 15:18:11.834');
INSERT INTO public."Permission" (id, key, module, action, description, "createdAt") VALUES ('de495740-e554-44b2-af08-473bc88980e5', 'inventory:write', 'inventory', 'write', 'Manage inventory', '2026-09-03 15:18:11.839');
INSERT INTO public."Permission" (id, key, module, action, description, "createdAt") VALUES ('d95f9d5b-3643-4a6d-ad51-2aeee7f6dfb3', 'announcement:read', 'communication', 'read', 'View announcements', '2026-09-03 15:18:11.844');
INSERT INTO public."Permission" (id, key, module, action, description, "createdAt") VALUES ('9f3e9bc1-1593-40e6-9567-ffceb5b85e2e', 'announcement:write', 'communication', 'write', 'Post announcements', '2026-09-03 15:18:11.851');
INSERT INTO public."Permission" (id, key, module, action, description, "createdAt") VALUES ('eff49c58-8be8-4f27-ab60-f59302667ab3', 'message:send', 'communication', 'send', 'Send messages', '2026-09-03 15:18:11.855');
INSERT INTO public."Permission" (id, key, module, action, description, "createdAt") VALUES ('dde74577-c84a-4675-950c-4d91d89d7e27', 'ai:chat', 'ai', 'chat', 'Use AI assistant', '2026-09-03 15:18:11.86');
INSERT INTO public."Permission" (id, key, module, action, description, "createdAt") VALUES ('fa19f06e-9d44-4128-b9cb-54665754c8aa', 'ai:insights', 'ai', 'read', 'View AI insights', '2026-09-03 15:18:11.868');
INSERT INTO public."Permission" (id, key, module, action, description, "createdAt") VALUES ('ec1815e4-ce8a-4fb0-be9a-198b368af074', 'admin:users', 'admin', 'manage', 'Manage users & roles', '2026-09-03 15:18:11.876');
INSERT INTO public."Permission" (id, key, module, action, description, "createdAt") VALUES ('cf732301-008f-4929-abf5-9cf88c1100f1', 'admin:org', 'admin', 'manage', 'Manage organisation settings', '2026-09-03 15:18:11.885');
INSERT INTO public."Permission" (id, key, module, action, description, "createdAt") VALUES ('6a73acb5-3373-4e28-82f1-e80e27e8614e', 'admin:branches', 'admin', 'manage', 'Manage branches', '2026-09-03 15:18:11.894');
INSERT INTO public."Permission" (id, key, module, action, description, "createdAt") VALUES ('7f1b31e8-2daf-4920-9572-af341bc31dc2', 'report:export', 'reports', 'export', 'Export reports / PDFs', '2026-09-03 15:18:11.917');
INSERT INTO public."Permission" (id, key, module, action, description, "createdAt") VALUES ('9fb6d25e-0477-47b1-8a2f-cf61a8a511c0', 'gamification:read', 'gamification', 'read', 'View badges and points', '2026-09-03 15:18:11.934');
INSERT INTO public."Permission" (id, key, module, action, description, "createdAt") VALUES ('ad3fa95c-c6ed-40d5-bce0-13d66113ec4e', 'gamification:award', 'gamification', 'award', 'Award badges to students', '2026-09-03 15:18:11.939');


ALTER TABLE public."Permission" ENABLE TRIGGER ALL;

--
-- Data for Name: PointsLedger; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public."PointsLedger" DISABLE TRIGGER ALL;

INSERT INTO public."PointsLedger" (id, "studentId", points, reason, "referenceType", "referenceId", "createdAt") VALUES ('ce506358-5cf0-40ad-8c81-274254f045c3', 'fa74d8a5-499c-48f3-9eff-a8e304531d8c', 10, 'Badge awarded: First Steps', 'Badge', 'c74406b9-c8db-4711-9c9d-271b38013856', '2026-09-03 15:18:16.809');
INSERT INTO public."PointsLedger" (id, "studentId", points, reason, "referenceType", "referenceId", "createdAt") VALUES ('731ca943-18c0-4ba3-9d70-c2a20044b1f9', 'fa74d8a5-499c-48f3-9eff-a8e304531d8c', 5, 'Observation milestone reached', 'Observation', NULL, '2026-09-03 15:18:16.809');
INSERT INTO public."PointsLedger" (id, "studentId", points, reason, "referenceType", "referenceId", "createdAt") VALUES ('86a4b0cc-ec7b-4ea7-98db-34195091a620', '7c968eac-81f5-44ba-bb7b-08664d16f1a9', 50, 'Badge awarded: Golden Achiever', 'Badge', 'a5401010-88f1-477b-9daf-15706dfb9485', '2026-09-03 15:18:16.816');


ALTER TABLE public."PointsLedger" ENABLE TRIGGER ALL;

--
-- Data for Name: PurchaseOrder; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public."PurchaseOrder" DISABLE TRIGGER ALL;



ALTER TABLE public."PurchaseOrder" ENABLE TRIGGER ALL;

--
-- Data for Name: PurchaseOrderLine; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public."PurchaseOrderLine" DISABLE TRIGGER ALL;



ALTER TABLE public."PurchaseOrderLine" ENABLE TRIGGER ALL;

--
-- Data for Name: RefreshToken; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public."RefreshToken" DISABLE TRIGGER ALL;

INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('c9013f67-e8fd-4b61-ac61-353b43bee2fd', '6d5c28e3-25ea-433d-96f7-fc2a2e5b6b8a', '$argon2id$v=19$m=65536,t=3,p=4$0yUnTrLbe6MENu5j8Y5utA$QPGR+stjhvGaFyuhlU90znd70Zij7XqhcvZ4h7oSqEc', NULL, '::1', '2026-09-11 00:49:09.446', '2026-09-04 01:02:34.207', '2026-09-04 00:49:09.448');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('2e760907-3069-49bf-b230-24c56c5a02d1', '6d5c28e3-25ea-433d-96f7-fc2a2e5b6b8a', '$argon2id$v=19$m=65536,t=3,p=4$3fILQI65u5fXpjdPkvcPsQ$YMISKOr+4Uk6zJPiVzrAKYNAvUUyYwXWr7kM8SZ88b8', NULL, '::1', '2026-09-11 01:02:34.467', NULL, '2026-09-04 01:02:34.469');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('e1e29583-c0aa-465a-9d34-e2da6f554583', '74f06c0a-b838-4549-8b86-6a6d386ff69f', '$argon2id$v=19$m=65536,t=3,p=4$ZubcMjtoAhDiIz5DUgPyUg$EIZu2MMEX0Z0WCooa2ii69GFZKbzpFPVXATkWf+Z4b0', NULL, '::1', '2026-09-11 03:25:24.747', '2026-09-04 03:30:08.78', '2026-09-04 03:25:24.749');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('00f1fc10-1dc1-4c33-b7e6-27a2c5233294', '74f06c0a-b838-4549-8b86-6a6d386ff69f', '$argon2id$v=19$m=65536,t=3,p=4$DBw4Vq4AcI3lsQlJQFKtiw$ky0pyq/8dJShA1gITZZ6XKDB+nyO7w8ft0W6rY2ymIg', NULL, '::1', '2026-09-11 01:06:22.423', '2026-09-04 01:26:26.407', '2026-09-04 01:06:22.424');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('530dc7a8-bbab-4a88-9dc2-b930ae0c7b19', '74f06c0a-b838-4549-8b86-6a6d386ff69f', '$argon2id$v=19$m=65536,t=3,p=4$+x0mUctegKyZ6mIRITn0PQ$xULwX6QrnGt0RmnNl9Wsbl604KPXamafaU4yOgpj4rQ', NULL, '::1', '2026-09-11 01:26:27.28', NULL, '2026-09-04 01:26:27.282');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('66df3e57-46b3-4d2e-8158-b7d7af92a3e0', '74f06c0a-b838-4549-8b86-6a6d386ff69f', '$argon2id$v=19$m=65536,t=3,p=4$tr65mUR+DdodDK1Yb+Ermg$BxKUmLPFIk7MKBqv+razvg+i82AEZpoB20CEMn4u3r8', NULL, '::1', '2026-09-11 03:30:09.143', NULL, '2026-09-04 03:30:09.146');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('426831b8-61d2-4cd8-aaac-add98dcf4d85', '6d5c28e3-25ea-433d-96f7-fc2a2e5b6b8a', '$argon2id$v=19$m=65536,t=3,p=4$6tnEEFUKqUZbLZLBZRbKNA$/upUi3qCUQHAiRn2Ks4Y5aaMKU+paI4uK/RjujU3pwc', NULL, '::1', '2026-09-11 01:02:34.472', '2026-09-04 01:26:27.409', '2026-09-04 01:02:34.473');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('0719fced-f4dc-4503-a83c-337ced1aa6c8', '6d5c28e3-25ea-433d-96f7-fc2a2e5b6b8a', '$argon2id$v=19$m=65536,t=3,p=4$l8++x4FTSQ4/tFTfZMx1ww$OMFCilT+LmD5f4CfEeueVihMxwcC0iYaPn1uvj3Emvk', NULL, '::1', '2026-09-11 01:26:27.739', NULL, '2026-09-04 01:26:27.741');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('386fc6ae-68f0-4e07-9943-87b93a14d0ef', '74f06c0a-b838-4549-8b86-6a6d386ff69f', '$argon2id$v=19$m=65536,t=3,p=4$lGSvtafVZ0Bs6r2uybJAqQ$qu9eb/N+FT3wW/O19WMQViPgqbmh3f/IQuNGNFU4QGs', NULL, '::1', '2026-09-11 01:26:27.377', '2026-09-04 01:49:34.607', '2026-09-04 01:26:27.379');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('25e903d8-f211-436e-8d86-f8ee1e9f6a34', '74f06c0a-b838-4549-8b86-6a6d386ff69f', '$argon2id$v=19$m=65536,t=3,p=4$8Qz56eYmiMJmPV1JiYv7LQ$tlg1ZIH7fK9te9h5UpdnHXtvfiCClki50dKIm7H1aaQ', NULL, '::1', '2026-09-11 01:49:34.897', NULL, '2026-09-04 01:49:34.899');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('e913c083-6177-4950-8304-758a1f3c468c', '74f06c0a-b838-4549-8b86-6a6d386ff69f', '$argon2id$v=19$m=65536,t=3,p=4$ZMINY/eeVWCHzvpwEYtwIQ$K14fqcb7PwBsi2sC4BtfoT+RyBZpJwi+wtdRKpqR3dY', NULL, '::1', '2026-09-11 03:31:43.981', '2026-09-04 03:31:55.267', '2026-09-04 03:31:43.982');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('d6b282c9-c0e6-458e-b35a-4a514516a695', '6d5c28e3-25ea-433d-96f7-fc2a2e5b6b8a', '$argon2id$v=19$m=65536,t=3,p=4$nwRHhO01sYGpEl66txQ51w$r6BDdaiOnAjxCP4D5DN0g3QYVEhT0GqFUfLHkdlVhLo', NULL, '::1', '2026-09-11 01:26:27.769', '2026-09-04 01:57:35.911', '2026-09-04 01:26:27.771');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('76a5e404-2188-4b2d-898c-6e2289e9c788', '6d5c28e3-25ea-433d-96f7-fc2a2e5b6b8a', '$argon2id$v=19$m=65536,t=3,p=4$qmHDv8PnH9I4DfHmqjVlpQ$X6tNuEnGTz7Lwv1cN7i5nmNMR3hWz0HyJXhijr7AU+c', NULL, '::1', '2026-09-11 01:57:36.199', NULL, '2026-09-04 01:57:36.2');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('7e8d0914-4cbd-4889-a41d-0e5f669f6972', '83407454-d11d-4026-a86d-064a3e45f933', '$argon2id$v=19$m=65536,t=3,p=4$d82DnP2VO3kUZFUELqqO6A$WAAxffDSIvEfV3gJV97JFzfjxfhBLYZ3hr7jLmjnxlo', NULL, '::1', '2026-09-11 03:30:06.667', '2026-09-04 03:31:36.774', '2026-09-04 03:30:06.669');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('c14a24f6-db31-4ab3-8bee-164154ea9b49', '83407454-d11d-4026-a86d-064a3e45f933', '$argon2id$v=19$m=65536,t=3,p=4$Rs//0fuI3Q1U0f5/Q0BF4Q$dLHDVPUHel/NNQWMNC0U37oVfMLNo322fFG9srTGZAI', NULL, '::1', '2026-09-11 02:20:16.388', '2026-09-04 03:21:03.494', '2026-09-04 02:20:16.39');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('242d6fce-3b18-4d77-aa12-93f8c57fd740', '83407454-d11d-4026-a86d-064a3e45f933', '$argon2id$v=19$m=65536,t=3,p=4$AhzuMovmRsN64Es2vjwEeQ$CFlv7t0PeJTw3BURa55y3tlmFWjBOzL93Lg/+kdp1Qo', NULL, '::1', '2026-09-11 03:21:04.335', NULL, '2026-09-04 03:21:04.336');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('550ae014-5506-4077-9f24-e636a7375835', '74f06c0a-b838-4549-8b86-6a6d386ff69f', '$argon2id$v=19$m=65536,t=3,p=4$jFYO+0KenVUuunv1BQcGsA$RR8KSje9+Y0AHHzNksMocXLJqE7zIqovcNSR9IIbxfc', NULL, '::1', '2026-09-11 01:49:34.894', '2026-09-04 03:25:24.291', '2026-09-04 01:49:34.896');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('5e033a77-28a1-4e84-96a4-70233ac92d86', '74f06c0a-b838-4549-8b86-6a6d386ff69f', '$argon2id$v=19$m=65536,t=3,p=4$OzBbMnQf+TwnjNzWLvrEvQ$tFDuNTlYK1PzKRfp27ICDHDjbX8PWLBWRpQ9YDJI+/w', NULL, '::1', '2026-09-11 03:25:24.706', NULL, '2026-09-04 03:25:24.709');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('ef2b0fbf-3863-4ccc-9f53-017aa9f85117', '83407454-d11d-4026-a86d-064a3e45f933', '$argon2id$v=19$m=65536,t=3,p=4$6kE6tUMElKb5VDFcEQGwqA$IcfitDwMk8YizqsKp4AtDnBbTsEIDLu9QQsEddHvF4U', NULL, '::1', '2026-09-11 03:31:37.165', NULL, '2026-09-04 03:31:37.167');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('d2254f89-5597-4a6a-a688-2225584cc763', '83407454-d11d-4026-a86d-064a3e45f933', '$argon2id$v=19$m=65536,t=3,p=4$zIdqtQqR7DKZxdBKrSzvHg$bOIpZa+4JwDsfhrs7PIT2qY2/M8YqNu+t5oCFxuNmkk', NULL, '::1', '2026-09-11 03:21:04.336', '2026-09-04 03:30:05.768', '2026-09-04 03:21:04.337');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('b4071bf8-724c-4195-b21e-6faa8cf5037a', '83407454-d11d-4026-a86d-064a3e45f933', '$argon2id$v=19$m=65536,t=3,p=4$J4CIHciasEtFwhgEA1U0WQ$WxOHUCHDeaRc3ANfP5YKD0HIBh0wQGBd7CStQyoed8g', NULL, '::1', '2026-09-11 03:30:06.146', NULL, '2026-09-04 03:30:06.148');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('0cbf818a-e4c0-497b-83a8-893a4146cb63', '74f06c0a-b838-4549-8b86-6a6d386ff69f', '$argon2id$v=19$m=65536,t=3,p=4$y7pRD2/h2A7LrCoC/MlkwA$/ur3mlg4tqud6KEGDTEq3xhviX8U1Yp6Om/4dohBD1o', NULL, '::1', '2026-09-11 03:31:55.59', NULL, '2026-09-04 03:31:55.591');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('3ab54f2a-b56d-4daf-b4db-1f3f57acd94b', '74f06c0a-b838-4549-8b86-6a6d386ff69f', '$argon2id$v=19$m=65536,t=3,p=4$dxrXqeQ2uasfTSgD19vjZw$kR2nosAX/ffv54O0XAwtUS2j+1CiCvzD5K6jOXoFSMM', NULL, '::1', '2026-09-11 03:30:09.181', '2026-09-04 03:31:43.459', '2026-09-04 03:30:09.185');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('60804127-222c-4f7b-b65c-8724b656d1be', '74f06c0a-b838-4549-8b86-6a6d386ff69f', '$argon2id$v=19$m=65536,t=3,p=4$77lh8IlqJv/pvWXLh6CzJg$UIpKWaSqj2TScVCHUjaZAVvFQzN4HJRsG1g27QsB8cU', NULL, '::1', '2026-09-11 03:31:43.965', NULL, '2026-09-04 03:31:43.966');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('75a7017a-26f0-4c00-89f8-096e44075de8', '83407454-d11d-4026-a86d-064a3e45f933', '$argon2id$v=19$m=65536,t=3,p=4$gxHARRJ60GdhlPSfHndr2Q$wRPwaN2iVgCIw/wZkVI0wbV70Aep04JxVmqn++rscQo', NULL, '::1', '2026-09-11 03:31:37.162', '2026-09-04 03:31:53.248', '2026-09-04 03:31:37.165');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('5f0425a3-6fe8-4c4b-901b-ad38ac203136', '83407454-d11d-4026-a86d-064a3e45f933', '$argon2id$v=19$m=65536,t=3,p=4$GSYrHQuKAc3pRE3WWWWtEA$hy3EpCNTwcKCHApNefbU3eS8b+h7hXm7qqvt2QYVXOc', NULL, '::1', '2026-09-11 03:31:53.564', NULL, '2026-09-04 03:31:53.566');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('6b9f5397-bab2-4704-9161-bbd5c34f3b55', '83407454-d11d-4026-a86d-064a3e45f933', '$argon2id$v=19$m=65536,t=3,p=4$6EEjlJIPos1QCqnXmtQwmA$VbMKYLKa5GIJ+TShG5oVk3exhB837fBR0xxUWlPwZGY', NULL, '::1', '2026-09-11 03:31:53.594', '2026-09-04 03:41:54.288', '2026-09-04 03:31:53.595');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('ee6f3b2a-9df3-41da-9324-4e1628221f13', '74f06c0a-b838-4549-8b86-6a6d386ff69f', '$argon2id$v=19$m=65536,t=3,p=4$BP/b0PspxFm1buxEl76eQg$t0YkFQLqQr20lPX5hVKsX6ojhLnnIyc7N+M5+IHNDQ8', NULL, '::1', '2026-09-11 03:31:55.593', '2026-09-04 03:33:06.323', '2026-09-04 03:31:55.595');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('850a37f9-281d-4497-93bf-86f0ced20394', '74f06c0a-b838-4549-8b86-6a6d386ff69f', '$argon2id$v=19$m=65536,t=3,p=4$LTNDpyYQs66fNRSf6/q2fQ$DvyRAT50nFY9n6E1WLhyhUf5ZpAQz4JvBGa9spELuD8', NULL, '::1', '2026-09-11 03:33:06.678', NULL, '2026-09-04 03:33:06.68');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('0112c41a-ddeb-4599-a85f-08c578a42be5', '83407454-d11d-4026-a86d-064a3e45f933', '$argon2id$v=19$m=65536,t=3,p=4$eNQkaXFJFZ/yJUzgg6YtGw$NOCjbH/ebnYf4SFD7/oIeJWeszZPWof1ckli7ZBOkmQ', NULL, '::1', '2026-09-11 03:41:54.61', NULL, '2026-09-04 03:41:54.615');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('856aea4e-17ee-46b9-baeb-052aed8cca3a', '83407454-d11d-4026-a86d-064a3e45f933', '$argon2id$v=19$m=65536,t=3,p=4$gQaLcRg9o+2ylefo7p8w0Q$/g6Xbnp1Vqp2qKslA5U5sJCdYKbUIh2C3Cx7c2xK3m0', NULL, '::1', '2026-09-11 03:41:54.615', '2026-09-04 03:42:11.4', '2026-09-04 03:41:54.616');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('29118dba-6786-4a3a-bfde-c470672f992e', '83407454-d11d-4026-a86d-064a3e45f933', '$argon2id$v=19$m=65536,t=3,p=4$rBcrm3GS2+1zKj4MMMGeYg$M7G5gbXscCv5M/pP00CSz4IRrkcOx8/ETpJsPR/ec0c', NULL, '::1', '2026-09-11 03:42:11.741', NULL, '2026-09-04 03:42:11.742');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('aca76325-01a2-4406-a5cc-b08e2a117093', '74f06c0a-b838-4549-8b86-6a6d386ff69f', '$argon2id$v=19$m=65536,t=3,p=4$pT0491FFZ29Z4DhOP3PDqg$B3AQabXvu3pPHnrD9cqV5BzWJLJEjY9FGSBRJ1mVhEE', NULL, '::1', '2026-09-11 03:33:06.681', '2026-09-04 03:56:21.872', '2026-09-04 03:33:06.682');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('d113438d-1bc5-4817-b6a9-2e76275f4692', '6d5c28e3-25ea-433d-96f7-fc2a2e5b6b8a', '$argon2id$v=19$m=65536,t=3,p=4$zjwIkVeCs9ZEAhONNvyaEQ$M/Res4MB8irUdbOPWNNzLJdLxs/URajfo1A/YNN3QGI', NULL, '::1', '2026-09-11 01:57:36.262', '2026-09-04 04:27:57.252', '2026-09-04 01:57:36.265');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('8391bb59-314c-4fe9-9b29-1fc54ac3c684', '83407454-d11d-4026-a86d-064a3e45f933', '$argon2id$v=19$m=65536,t=3,p=4$fWpoVqm+38/ZmEahulWbmg$FuEvUKJ0cEkLWUUDo6on4ZH/cLMmPxy1NZsRXKpLRWs', NULL, '::1', '2026-09-11 03:42:11.75', '2026-09-04 03:44:16.63', '2026-09-04 03:42:11.751');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('908df176-bc6d-47a0-b2f7-ddd1dedfb6f1', '83407454-d11d-4026-a86d-064a3e45f933', '$argon2id$v=19$m=65536,t=3,p=4$a1+fUL3o5nOX5ojQ9cxe1A$CUIt5xJlRHe8iwCXqSBB3OnP7Ti8fYb0yPHiDYH/s1o', NULL, '::1', '2026-09-11 03:44:16.959', NULL, '2026-09-04 03:44:16.961');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('82641d2f-b23f-4989-86d2-12f6cf752e90', '74f06c0a-b838-4549-8b86-6a6d386ff69f', '$argon2id$v=19$m=65536,t=3,p=4$bkDiYbQEWInQH8DO9runFw$hy+tgH7yFBvNglmponrCh9cWiNYorinsExOFxncxyw8', NULL, '::1', '2026-09-11 03:56:22.226', NULL, '2026-09-04 03:56:22.228');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('7b5415a8-3eba-4fe1-9997-b2f719b44c4b', '74f06c0a-b838-4549-8b86-6a6d386ff69f', '$argon2id$v=19$m=65536,t=3,p=4$3ludzgBRZMnc69UTpUpQ/g$gFZef/CrzqbAkLct5hUVpxRKiHKYcKlgUOnah+chhZc', NULL, '::1', '2026-09-11 03:56:22.252', NULL, '2026-09-04 03:56:22.254');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('78ee3fde-b1ca-45a9-a7db-193faa79cecb', '74f06c0a-b838-4549-8b86-6a6d386ff69f', '$argon2id$v=19$m=65536,t=3,p=4$RictKi4uF0IncKfpzA8Akw$lOgNBWKOTmocvwPyQLBVL4xOpX3uRSRy7y879ExLzVQ', NULL, '::1', '2026-09-11 04:24:05.686', NULL, '2026-09-04 04:24:05.689');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('d8249348-977a-456b-a07a-61b72d106d28', '6d5c28e3-25ea-433d-96f7-fc2a2e5b6b8a', '$argon2id$v=19$m=65536,t=3,p=4$WiXtDDmC/c7Xr23L/pq82Q$PgtMGzUydj9k4bsTYP8nlv7JOn8YhDw9rQFIVPHXmgw', NULL, '::1', '2026-09-11 04:27:57.884', NULL, '2026-09-04 04:27:57.886');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('600bcbc1-94b7-4b56-8847-b84ffc32afe7', '6d5c28e3-25ea-433d-96f7-fc2a2e5b6b8a', '$argon2id$v=19$m=65536,t=3,p=4$qrV2jQ4Or53eKVYZIJxPTg$Bb/IeiPST7E/dkODoI8X/WPgc6rVD3v7zURueb0KRj0', NULL, '::1', '2026-09-11 04:27:57.888', NULL, '2026-09-04 04:27:57.89');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('a970fab7-ee14-4d92-8d01-1101c668007e', '4889a8e9-58de-422e-9cb1-2a9849420e91', '$argon2id$v=19$m=65536,t=3,p=4$gL2UC4/gGODwrbpstEniNw$ydxBLx/3br/jaR01/T4LM7GtHiXOx6z+R2HJWW3GThs', NULL, '::1', '2026-09-11 04:44:29.886', NULL, '2026-09-04 04:44:29.888');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('d712099a-f18b-43b6-90e9-1c0f2f61bd7b', '83407454-d11d-4026-a86d-064a3e45f933', '$argon2id$v=19$m=65536,t=3,p=4$i0a5knmWoDfgTswuBHNTBw$9VjitzryjivADNZ13PRRjli4UjAEglgyhiKk18g9RU0', NULL, '::1', '2026-09-11 03:44:16.954', '2026-09-04 10:27:37.538', '2026-09-04 03:44:16.956');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('ccccd89c-aa12-4831-a48b-8acfc2e28c45', '1b0cb6e1-b800-4e88-aea2-1ef397b652b3', '$argon2id$v=19$m=65536,t=3,p=4$ORm3frNKWkHohJp6w8iXXQ$iHNRQ+YGr4CBeNGq4SiE9O2eGAtb/hATuqhlChUUg/k', NULL, '::1', '2026-09-11 04:49:40.164', '2026-09-04 05:00:43.623', '2026-09-04 04:49:40.166');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('5f7e773e-4529-499f-83e3-5a8e0a223000', '1b0cb6e1-b800-4e88-aea2-1ef397b652b3', '$argon2id$v=19$m=65536,t=3,p=4$hbCmcVydjN3c6NA+FV07Ug$bNg8SYKaZUoC/AGwB1ddzwpCIiGzQm8UnTE+gJJZpfo', NULL, '::1', '2026-09-11 05:00:44.596', NULL, '2026-09-04 05:00:44.598');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('c093b24a-512c-4efe-8620-3dfcfc3ce629', '6d5c28e3-25ea-433d-96f7-fc2a2e5b6b8a', '$argon2id$v=19$m=65536,t=3,p=4$r0AnThvVyhMJA6IiJJlh8g$HoPso71ZnkqBNgVlRf+OT57qt0MGfUYzAFjFmGlMHvM', NULL, '::1', '2026-09-11 07:16:14.601', '2026-09-04 07:18:30.672', '2026-09-04 07:16:14.603');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('97a68a63-59ed-4a45-89de-e4f4f04dd77d', 'dc3fa849-2543-4d90-991b-fd3acacadde4', '$argon2id$v=19$m=65536,t=3,p=4$FzXPsdnDw9ya4P7MVAzHGw$/vP9vVvnZcpHnt0AHENDHE+YZB4pgnR2slsogYbU7Mo', NULL, '::1', '2026-09-11 04:52:02.1', '2026-09-04 05:10:14.752', '2026-09-04 04:52:02.103');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('787883f2-cb55-44f7-88e6-cee69ac8da18', 'dc3fa849-2543-4d90-991b-fd3acacadde4', '$argon2id$v=19$m=65536,t=3,p=4$KsZr768FJ2SzONCmCbV1lg$q0K9XjU1hF65NaLAwZX/iILouEFRiKb84PFa3+8pPNY', NULL, '::1', '2026-09-11 05:10:15.329', NULL, '2026-09-04 05:10:15.331');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('0d24f095-91d5-4eaa-b161-7ab516316d09', '6d5c28e3-25ea-433d-96f7-fc2a2e5b6b8a', '$argon2id$v=19$m=65536,t=3,p=4$vv0jkY33dKRFlaI7cNL0Hw$AoaXRtTvoeAaQDJcZvZbHvipjhgNXj3FlWNlWJ4kzH4', NULL, '::1', '2026-09-11 07:18:30.848', NULL, '2026-09-04 07:18:30.85');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('6991e12f-b6d7-4392-a3e8-aac350e2ae9b', '3fcda805-31ba-4596-af43-a3d57babf0d8', '$argon2id$v=19$m=65536,t=3,p=4$WdNRW35X9NurRU7n1qgVWw$x7SRNfKloBU3w9AHbgKgN/16Zfd2Kv6Rp/biphb58MA', NULL, '::1', '2026-09-11 04:48:34.029', '2026-09-04 05:10:46.283', '2026-09-04 04:48:34.03');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('29459368-2424-41eb-a148-783cf8d45c5b', '3fcda805-31ba-4596-af43-a3d57babf0d8', '$argon2id$v=19$m=65536,t=3,p=4$MnNviWoySuJpmC3Luf3K4A$jBcqhM7pySGJN1YYVaX48C/H88Ag/gpfwyuyvop2gjo', NULL, '::1', '2026-09-11 05:10:46.68', NULL, '2026-09-04 05:10:46.682');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('6b4d501d-737e-450d-99fd-faedfc4931af', '6d5c28e3-25ea-433d-96f7-fc2a2e5b6b8a', '$argon2id$v=19$m=65536,t=3,p=4$cClhkf2VXRHhD4MDCT0SXg$hr5XG5HeyqVFUYNTS7zSYzvV6FyFcE5PotirhkkK5JU', NULL, '::1', '2026-09-11 07:18:30.947', NULL, '2026-09-04 07:18:30.948');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('08085172-3ce5-4fd5-a5df-94a1d96ea189', 'dc3fa849-2543-4d90-991b-fd3acacadde4', '$argon2id$v=19$m=65536,t=3,p=4$+Dwc1IDPUQeFQ70g8t2Ibg$Tc0VmM5vFX8gHEr8c42NoE1n30Ad3Eb/k/lC9geKH/4', NULL, '::1', '2026-09-11 05:10:15.382', '2026-09-04 05:15:45.604', '2026-09-04 05:10:15.384');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('589b24ae-eee0-4c15-8fc3-c487ef94aaf2', 'dc3fa849-2543-4d90-991b-fd3acacadde4', '$argon2id$v=19$m=65536,t=3,p=4$+KDvWaQ71DDBfynLMZCwSQ$nqP+U9CeMEBmcJw7YudI97Hb02HDzEkkUGz5fJE0Mw0', NULL, '::1', '2026-09-11 05:15:46.15', NULL, '2026-09-04 05:15:46.153');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('a874b44b-4d9c-49a4-8f93-4a300882b49d', 'dc3fa849-2543-4d90-991b-fd3acacadde4', '$argon2id$v=19$m=65536,t=3,p=4$UWMSoz/W5ThGKcekynlVqQ$2M3QG1mPLQGiiHFhxXJxhdM9qHVrOlfPx8IWBX/oGHo', NULL, '::1', '2026-09-11 05:15:46.327', NULL, '2026-09-04 05:15:46.333');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('eae1140b-21c3-4123-8154-3debae7cdc77', '1b0cb6e1-b800-4e88-aea2-1ef397b652b3', '$argon2id$v=19$m=65536,t=3,p=4$yArpxookdpPAFgW8ywfC8g$ExBV3m2/iYbIvxbXk+Au8JKxos7mU4l88bR6g/VjsbA', NULL, '::1', '2026-09-11 05:00:44.675', '2026-09-04 05:16:30.209', '2026-09-04 05:00:44.677');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('de25492e-1d29-49d6-a75f-7189ce19439d', '1b0cb6e1-b800-4e88-aea2-1ef397b652b3', '$argon2id$v=19$m=65536,t=3,p=4$Chc7AqPO2wh0VO+VlwRVEw$aTce1KBOkoiQ1/8mKN84S/UVtXpBttkWkoKHaS2qlKU', NULL, '::1', '2026-09-11 05:16:31.404', NULL, '2026-09-04 05:16:31.406');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('aa83cb6a-c28d-4eaa-bcce-68e5dd147749', '1b0cb6e1-b800-4e88-aea2-1ef397b652b3', '$argon2id$v=19$m=65536,t=3,p=4$hZ9BLwkAuJZKp5QvoSDpmg$YLn/dhb3KmhumMlBoV4sh+QpxiN2Khzrfn2AqHDCsoM', NULL, '::1', '2026-09-11 05:16:32.343', '2026-09-04 10:24:47.032', '2026-09-04 05:16:32.344');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('ccc4fc0c-0ce6-40ef-9523-17b15ce28b5d', '1b0cb6e1-b800-4e88-aea2-1ef397b652b3', '$argon2id$v=19$m=65536,t=3,p=4$OdbqhLzgZ3iPlKDwXUL74Q$D/m7yhVntsJkDQwa9gFVSowa6/c9n292R3JT4PIvylc', NULL, '::1', '2026-09-11 10:24:47.582', NULL, '2026-09-04 10:24:47.584');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('3c4e5d53-1f81-4795-8cde-3773f44ec72f', '1b0cb6e1-b800-4e88-aea2-1ef397b652b3', '$argon2id$v=19$m=65536,t=3,p=4$kRMJbIHlMkXk2apIpFvOjg$KslknZOsb/zVFf0kA5dh+8RFPNlguUdOjJJCN3R64k0', NULL, '::1', '2026-09-11 10:24:47.633', NULL, '2026-09-04 10:24:47.635');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('fcd3d925-cfa3-4cac-8f5c-8436bba57838', '83407454-d11d-4026-a86d-064a3e45f933', '$argon2id$v=19$m=65536,t=3,p=4$heIYb5Ll+fxPG7h+bAyvGg$sZe6mtf9QCPoXOoow4iKLu3L6/9B9tERvSM17cwk0AQ', NULL, '::1', '2026-09-11 10:27:36.804', NULL, '2026-09-04 10:27:36.806');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('e7b6615a-bfaa-41ec-afe6-e3db643a2624', '6d5c28e3-25ea-433d-96f7-fc2a2e5b6b8a', '$argon2id$v=19$m=65536,t=3,p=4$8fafqik0SycFetyIdcjGuA$XP9T3zKXEIXa29+zSYa793wXh/KzgF1ozxTa2nylpWw', NULL, '::1', '2026-09-11 10:20:39.321', '2026-09-04 12:29:20.191', '2026-09-04 10:20:39.326');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('ebe7b8a5-6450-4330-a095-0d67bc85b2bb', '83407454-d11d-4026-a86d-064a3e45f933', '$argon2id$v=19$m=65536,t=3,p=4$o3lbzixjz+xJNgEbSa2U3A$a9uUCRS96R8/uAeY8fa7jzJZh72aoBW8Jtt/BUtwrNE', NULL, '::1', '2026-09-11 10:27:38.042', '2026-09-04 10:43:49.575', '2026-09-04 10:27:38.046');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('ec6d8c8d-98a7-438c-99af-fb1623d3b60b', '83407454-d11d-4026-a86d-064a3e45f933', '$argon2id$v=19$m=65536,t=3,p=4$/dIH/aGxY4w3VF+qlWEqWg$y1PA5wyclOa1f01Ev4iwyt/MT4DnWbnuh3zow71hBGg', NULL, '::1', '2026-09-11 10:43:50.002', NULL, '2026-09-04 10:43:50.005');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('68c1f2a5-84e1-4a60-9ffd-6a2940b936f0', '6d5c28e3-25ea-433d-96f7-fc2a2e5b6b8a', '$argon2id$v=19$m=65536,t=3,p=4$qL+Z9/UR2gbmN8zkR01ZMg$n3NiZZAyNCdgxIvxJf9LIIff3IT0UWwh+8kRmat03PQ', NULL, '::1', '2026-09-11 12:29:20.573', NULL, '2026-09-04 12:29:20.575');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('3cf132a9-0ea2-485a-9ac2-bbfac461b40a', '83407454-d11d-4026-a86d-064a3e45f933', '$argon2id$v=19$m=65536,t=3,p=4$oY9EDfWqAvEnDV3BQqNthQ$xtaXd/By1mqHpBUtqtUAEiziimWGxyOKCi+JSgJQBb4', NULL, '::1', '2026-09-11 10:43:50.066', '2026-09-04 13:27:25.07', '2026-09-04 10:43:50.068');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('68fae1bc-e7e9-4f93-9cd7-0ce3ea9c474f', '6d5c28e3-25ea-433d-96f7-fc2a2e5b6b8a', '$argon2id$v=19$m=65536,t=3,p=4$3+lKoMv+gI3KqT+EzRFYgw$qfcf4HdLiacEchAsuHua/TWSNuxkmK3mFri1iXCwGkA', NULL, '::1', '2026-09-11 12:29:20.572', '2026-09-04 14:07:31.834', '2026-09-04 12:29:20.574');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('1d471845-4b8e-410c-a329-3f6690584efd', '3fcda805-31ba-4596-af43-a3d57babf0d8', '$argon2id$v=19$m=65536,t=3,p=4$V6Fk/yaZpeGW2VFYgl8BLg$bvzcJsXRlyXh/QLhsdnYieCv2envz3G0UOdMID/QjZs', NULL, '::1', '2026-09-11 05:10:46.688', '2026-09-04 17:29:14.584', '2026-09-04 05:10:46.69');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('d3176100-127e-48ba-8ab0-29dfc99af66e', '3fcda805-31ba-4596-af43-a3d57babf0d8', '$argon2id$v=19$m=65536,t=3,p=4$Ya+uDaqjiM9PXTX/E1f3og$rAxW2iE6AcmVGmIYXesSGHqb2M23b0lmKVTQt+LNGqY', NULL, '::1', '2026-09-11 17:29:14.937', NULL, '2026-09-04 17:29:14.942');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('c18ade93-71d0-44f9-80ea-0912164fcd0d', '304d564b-7ce6-4ef3-b27c-2b7709881448', '$argon2id$v=19$m=65536,t=3,p=4$ov9zRc0aDPE6Nl/cgtG5nw$rYE62YSm/PVcWfU8U8nBZuUzFIvUvFy8a4HvzpALOQk', NULL, '::1', '2026-09-11 13:02:06.592', '2026-09-04 13:15:24.035', '2026-09-04 13:02:06.593');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('5070eaa6-a601-4aac-a61d-9bfb5824e0f4', '304d564b-7ce6-4ef3-b27c-2b7709881448', '$argon2id$v=19$m=65536,t=3,p=4$x7p2TkxAUmrIPUhsgsHi6A$gx/WRp1HEuQOzVEmOHoANXwonp5dBH213DRlDGLruh4', NULL, '::1', '2026-09-11 13:15:24.379', NULL, '2026-09-04 13:15:24.381');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('a671e3a4-9af2-4590-be1a-ad663639fcdb', '304d564b-7ce6-4ef3-b27c-2b7709881448', '$argon2id$v=19$m=65536,t=3,p=4$dqqsJByirskM68HbJbBicw$7WvSEzaSEMed5dxuO0bbfW+fpZXaA/8D49FCKlIYLEs', NULL, '::1', '2026-09-11 13:18:27.139', NULL, '2026-09-04 13:18:27.14');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('c030a930-19f4-4140-9a38-500e14c2b4d4', '304d564b-7ce6-4ef3-b27c-2b7709881448', '$argon2id$v=19$m=65536,t=3,p=4$0otBF+QYz/hyaRNBKJx8Rg$3toNY9ofzmQMbgh2hZ5jOSZ80/7U3Evb6OoidmNFiSg', NULL, '::1', '2026-09-11 13:20:36.863', NULL, '2026-09-04 13:20:36.865');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('be76d049-27d1-4899-a1b9-8f2ecfab66cf', '6d5c28e3-25ea-433d-96f7-fc2a2e5b6b8a', '$argon2id$v=19$m=65536,t=3,p=4$jiEbNaqeXbtUC2hOS+oWbw$Pgz6tuPFB4hIvMWS71LMzuQTUo1GjrGMgeurIWNesfs', NULL, '::1', '2026-09-11 14:27:20.67', '2026-09-04 15:15:10.788', '2026-09-04 14:27:20.671');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('b68a5b14-b591-4bd0-9994-23739bc1000e', '304d564b-7ce6-4ef3-b27c-2b7709881448', '$argon2id$v=19$m=65536,t=3,p=4$+Ucm0AkLExAFXJJMHIckLQ$GLk2YnGUhS5K0xlF/HEb1h7XcdPpfUtZnaCb5O5/sB4', NULL, '::1', '2026-09-11 13:15:24.382', '2026-09-04 13:21:45.478', '2026-09-04 13:15:24.384');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('57879b00-736c-4a62-95c8-08189d4b1ec8', '304d564b-7ce6-4ef3-b27c-2b7709881448', '$argon2id$v=19$m=65536,t=3,p=4$DFBmOUyn/aiWvjld78DKOQ$NtLtMltoPGlwigqiPVRL7wmfNsUAYh9XGAW7XyfsMIk', NULL, '::1', '2026-09-11 13:21:45.806', NULL, '2026-09-04 13:21:45.809');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('d927d5d0-2e64-46d0-908c-9f326bbfd9ad', '304d564b-7ce6-4ef3-b27c-2b7709881448', '$argon2id$v=19$m=65536,t=3,p=4$xlmMAguQRPOT+u2HRXhkBA$kXAt91/KdMvE3jxXX+wkvKXhZtrzfoqe0LD63k58/bg', NULL, '::1', '2026-09-11 13:21:45.821', NULL, '2026-09-04 13:21:45.823');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('71431b95-e852-4161-99ba-0c0e2b30bb3e', '83407454-d11d-4026-a86d-064a3e45f933', '$argon2id$v=19$m=65536,t=3,p=4$lEqBW1rABr7nUoHVYqzAJQ$7DqGYfqA1iwfPoaaY4Drs90Xca73cjayYtdtszjVSN8', NULL, '::1', '2026-09-11 13:27:25.445', NULL, '2026-09-04 13:27:25.446');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('6fc404c0-89ed-406d-a852-f0a88f7e78f8', '4889a8e9-58de-422e-9cb1-2a9849420e91', '$argon2id$v=19$m=65536,t=3,p=4$r687/thMSHlD+h9XKqag/Q$zQ4CDL2kjoErSv3aOGf/GZvvmroyiAnhZnWUgtl+NRw', NULL, '::1', '2026-09-11 13:28:03.345', NULL, '2026-09-04 13:28:03.347');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('7c40ca16-957d-453d-b30b-7a08d4de83ee', '6d5c28e3-25ea-433d-96f7-fc2a2e5b6b8a', '$argon2id$v=19$m=65536,t=3,p=4$SAmje2HkD/nicugfRh0HpQ$CkkajH7zRpqQXw0+xHIzcZc+IZhb3vBckBdzvDYtO6o', NULL, '::1', '2026-09-11 15:15:11.217', NULL, '2026-09-04 15:15:11.219');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('2f2ba126-ce3b-4708-9db8-5131391f21d1', '83407454-d11d-4026-a86d-064a3e45f933', '$argon2id$v=19$m=65536,t=3,p=4$6pV0UAtjRa2zk+uL5S7++Q$A5nNCdONhD4BvAv5qsuFqOE9+vrh+hDwm6+9rB3BteM', NULL, '::1', '2026-09-11 13:27:25.447', '2026-09-04 13:28:52.755', '2026-09-04 13:27:25.449');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('78518ae8-b44f-4385-91c0-68dbc945c5d3', '83407454-d11d-4026-a86d-064a3e45f933', '$argon2id$v=19$m=65536,t=3,p=4$BiA2Y5Ib/J5SpxnDYdJASQ$uAGDZi9jwqqY876saSGQDwr/A/gTSVPAYe4nw2Epvgg', NULL, '::1', '2026-09-11 13:28:53.206', NULL, '2026-09-04 13:28:53.208');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('68e1883c-0ddc-4d85-b42f-0950717cf73b', '83407454-d11d-4026-a86d-064a3e45f933', '$argon2id$v=19$m=65536,t=3,p=4$A94oBrf6r5QIbWoUfTy3jw$uem2wnewmvol31uJWgBLPyMegJ9q20ox7aqeKPG+M5Q', NULL, '::1', '2026-09-11 13:28:53.284', '2026-09-04 13:32:18.986', '2026-09-04 13:28:53.286');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('73ddde74-20b9-4c4a-b143-e593cc6d91a8', '83407454-d11d-4026-a86d-064a3e45f933', '$argon2id$v=19$m=65536,t=3,p=4$xmBvWk/WGz9qoi6dpnmenQ$CDvomYXNEm8Uld23uczi+y0Ohmc1KxXG5KaPuplGEnY', NULL, '::1', '2026-09-11 13:32:19.241', NULL, '2026-09-04 13:32:19.243');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('89aad902-2b19-401e-b370-93060cb1ea27', '6d5c28e3-25ea-433d-96f7-fc2a2e5b6b8a', '$argon2id$v=19$m=65536,t=3,p=4$wVKxTxiLNyYxmOqqYljFzg$NLRQ0Gq1EnDNRvcWvdjYxYPWc/1WNvBp0CSEwTO+110', NULL, '::1', '2026-09-11 17:02:58.43', '2026-09-04 17:21:56.671', '2026-09-04 17:02:58.432');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('81e900bc-29da-4016-8513-4b1e942dd9ba', '83407454-d11d-4026-a86d-064a3e45f933', '$argon2id$v=19$m=65536,t=3,p=4$pFrwZC6uxAeOBduklLmU6w$UoieR7JPAiNPAmol3k+xuGFYO3Zs/3Kpn1fhcRNoJcQ', NULL, '::1', '2026-09-11 13:32:19.247', '2026-09-04 13:44:36.071', '2026-09-04 13:32:19.248');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('44ac3ab6-73f2-4615-9742-1f4a2b7ce8a9', '83407454-d11d-4026-a86d-064a3e45f933', '$argon2id$v=19$m=65536,t=3,p=4$xROAdHox1BS8xl4wttZ+9g$il55UNE8WX1Tw2OPW5BwBxwaH0UUxFLSl+JomgzAA14', NULL, '::1', '2026-09-11 13:44:36.39', NULL, '2026-09-04 13:44:36.396');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('29536ed5-3555-49f1-8d1f-064f80709385', '6d5c28e3-25ea-433d-96f7-fc2a2e5b6b8a', '$argon2id$v=19$m=65536,t=3,p=4$nruNCmImVgpu9/plxkcp8Q$ooaxqDENHo+WZEBnDx4qE4PYe61PEOvrDDo1LKMPJzA', NULL, '::1', '2026-09-11 15:15:11.223', '2026-09-04 15:26:44.775', '2026-09-04 15:15:11.225');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('8d954e8f-58c0-44c5-af15-f9d112b82b78', '83407454-d11d-4026-a86d-064a3e45f933', '$argon2id$v=19$m=65536,t=3,p=4$IdDejxms4sKpCjAoV1LFIg$CSKs5WjOqJ0gz7HsBtGS/hyfbo7mWyTmgj9XAHvDdYY', NULL, '::1', '2026-09-11 13:44:36.531', '2026-09-04 13:53:29.091', '2026-09-04 13:44:36.537');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('f97e6317-4106-457d-a78d-f9849ac3cbbf', '83407454-d11d-4026-a86d-064a3e45f933', '$argon2id$v=19$m=65536,t=3,p=4$n24YZYfe+AsoACIm8luZGQ$vlduvKMcpyaWevmLSPqyT2/Mc6qzSY4hB4Y9S+KNfVU', NULL, '::1', '2026-09-11 13:53:29.385', NULL, '2026-09-04 13:53:29.387');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('42654019-53a8-4730-82c5-da8b63fb21fd', '83407454-d11d-4026-a86d-064a3e45f933', '$argon2id$v=19$m=65536,t=3,p=4$TiD/hemmmXhzRphx7Eaaqg$puPRv39rQ/kUvPFrECBSgcUePrVgGWTifz1+8FeG2yM', NULL, '::1', '2026-09-11 13:53:29.397', NULL, '2026-09-04 13:53:29.399');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('8994640c-58e0-4c9a-8c95-03830bd0ca89', '6d5c28e3-25ea-433d-96f7-fc2a2e5b6b8a', '$argon2id$v=19$m=65536,t=3,p=4$/XwOVl4SPoLyIWMTzS8Edg$81DRcbBqH/OsAKnOYjciOqN1UcrgHmobtPruRqm5KsQ', NULL, '::1', '2026-09-11 14:07:32.176', NULL, '2026-09-04 14:07:32.178');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('314a580c-7988-4835-be3e-b56e323bd69f', '6d5c28e3-25ea-433d-96f7-fc2a2e5b6b8a', '$argon2id$v=19$m=65536,t=3,p=4$2oDB2MfzPBTL7X3lxkONNQ$muEt/VeHqeOLyEwsTaEV9L7tAeYVl7pPH/Ez1kS4xo0', NULL, '::1', '2026-09-11 15:26:45.186', NULL, '2026-09-04 15:26:45.187');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('3b156aa1-a185-4ccd-b303-d8e62b63cb71', '6d5c28e3-25ea-433d-96f7-fc2a2e5b6b8a', '$argon2id$v=19$m=65536,t=3,p=4$q1YpCft6oNwdRD6xA6MUlg$zKAEQiawcvp9BE9i87MVwetLWcD1BdABRpXaHUb6xkI', NULL, '::1', '2026-09-11 14:07:32.175', '2026-09-04 14:27:20.403', '2026-09-04 14:07:32.178');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('903f0b2b-5440-44b0-a66c-f44202ba1d47', '6d5c28e3-25ea-433d-96f7-fc2a2e5b6b8a', '$argon2id$v=19$m=65536,t=3,p=4$hpxB47fos2bdIcb9D5E6vA$ebcz5VoRpSIBYictqXSizozsAFvLz+CwURbiu1t6eWI', NULL, '::1', '2026-09-11 14:27:20.673', NULL, '2026-09-04 14:27:20.674');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('c885c151-4928-4a29-8b94-ea1d8a5bdbd1', '83407454-d11d-4026-a86d-064a3e45f933', '$argon2id$v=19$m=65536,t=3,p=4$XLZmu3EoLYWLSkAsVxwC9A$BrzJaI42jNpMnI/9+zBHxkhPVWpCoimFG9/nwm5YeaU', NULL, '::1', '2026-09-11 16:12:47.632', NULL, '2026-09-04 16:12:47.634');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('2381aa76-3f8b-440b-b5ad-be0ddf1709af', '6d5c28e3-25ea-433d-96f7-fc2a2e5b6b8a', '$argon2id$v=19$m=65536,t=3,p=4$0TTPeLOi9q4Gt9S/VV22OA$ioffJv12KzRszsXEKJhea5QO28pHupBvlEB4ql08e7E', NULL, '::1', '2026-09-11 15:26:45.196', '2026-09-04 17:02:58.182', '2026-09-04 15:26:45.197');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('66a14cf6-87b1-425d-8444-4a87da9d9557', '6d5c28e3-25ea-433d-96f7-fc2a2e5b6b8a', '$argon2id$v=19$m=65536,t=3,p=4$sqWvPlMlRM4MoqzJTI237w$QdMd+m82qxJhc2HmvFCXOrWFz+1CiBeOH3Myt7rmlZM', NULL, '::1', '2026-09-11 17:02:58.395', NULL, '2026-09-04 17:02:58.396');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('4b4305d5-d5d1-4605-bbed-b3d18d2b7590', '6d5c28e3-25ea-433d-96f7-fc2a2e5b6b8a', '$argon2id$v=19$m=65536,t=3,p=4$N54fj0EcRqGZriVLJw9S8g$AGlFuJXA3KM9sRxWTCiWvUQb6jVwv1Ms/kfR1nFFgAo', NULL, '::1', '2026-09-11 17:21:57.015', NULL, '2026-09-04 17:21:57.016');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('12726f1f-11f8-405b-8da7-f92556a5054c', '1b0cb6e1-b800-4e88-aea2-1ef397b652b3', '$argon2id$v=19$m=65536,t=3,p=4$eFQQKOtDi3IMrQPADod1lQ$Xwh0fgzvx88JowGjN5Z6lhmaf4ns99xoTXBO92xkiPo', NULL, '::1', '2026-09-11 17:30:31.402', '2026-09-04 17:31:49.01', '2026-09-04 17:30:31.403');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('107851db-1511-4910-816a-7162af27639a', '3fcda805-31ba-4596-af43-a3d57babf0d8', '$argon2id$v=19$m=65536,t=3,p=4$O3s1HOFEmqPMLADgzI9o8A$NDyEbHFGVapqj/LxpEQ1K04qBF8qVqFCcZDW+I1zZXU', NULL, '::1', '2026-09-11 17:29:14.944', '2026-09-04 17:55:42.04', '2026-09-04 17:29:14.946');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('fb408c8d-f1d1-4c77-9bc7-2e169c4577a0', '6d5c28e3-25ea-433d-96f7-fc2a2e5b6b8a', '$argon2id$v=19$m=65536,t=3,p=4$u6DVOxOhy+1mYkuAaNDagw$c6hZui4CDeTHUoHNvwOcpm7N8/yFV95flAYBWzVItf4', NULL, '::1', '2026-09-11 17:21:57.014', '2026-09-04 17:55:49.206', '2026-09-04 17:21:57.016');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('2d8301fe-5cbf-42e8-a8e0-58f6b9da58d4', '1b0cb6e1-b800-4e88-aea2-1ef397b652b3', '$argon2id$v=19$m=65536,t=3,p=4$xImY8NKHWUVmsAYmykk4DA$3mg5uQM14Har9pIeByi3YWMELmIHNTQhcT1brotYZaY', NULL, '::1', '2026-09-11 17:31:49.695', NULL, '2026-09-04 17:31:49.714');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('d03a4cd7-7b37-462f-972a-285114266009', '1b0cb6e1-b800-4e88-aea2-1ef397b652b3', '$argon2id$v=19$m=65536,t=3,p=4$FlqnOgd84HvwQvE4zA8O4w$q5/V0zFEY6s8iQ/TfFaZ7vPHysupEG9vFytnYzg5AnE', NULL, '::1', '2026-09-11 17:31:49.676', '2026-09-04 17:34:57.98', '2026-09-04 17:31:49.679');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('82ad9637-da93-4a15-b4c1-57a3f370744a', '1b0cb6e1-b800-4e88-aea2-1ef397b652b3', '$argon2id$v=19$m=65536,t=3,p=4$TIi05BnchpsZZmhZiJRobg$ApHcuXIdGe1qntYsCU11mW4fluaXLkkGWfMxh5lHaGs', NULL, '::1', '2026-09-11 17:34:58.361', NULL, '2026-09-04 17:34:58.362');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('5c04cf22-608b-450b-8084-0fca3c05a2c2', '6d5c28e3-25ea-433d-96f7-fc2a2e5b6b8a', '$argon2id$v=19$m=65536,t=3,p=4$KmqApdeSdp1mu4+Va0kZeg$ojAbvdwWr7mUNonRG1/pHrECKXYws2U7mNsOrYo3gUM', NULL, '::1', '2026-09-11 17:55:49.519', '2026-09-04 18:05:46.144', '2026-09-04 17:55:49.521');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('5843cb24-ed08-4620-a3cc-dfcb67434b15', '1b0cb6e1-b800-4e88-aea2-1ef397b652b3', '$argon2id$v=19$m=65536,t=3,p=4$yc2ym2AN0ZAGGGcm+vS1vQ$5FHFDfLKju/0i5QTDCf3k4Jh8wPpkpMbxfso9isUDVA', NULL, '::1', '2026-09-11 17:34:58.346', '2026-09-04 17:47:59.781', '2026-09-04 17:34:58.348');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('3f3ff2f7-3aa0-4acd-94d6-0b625ed8e57e', '1b0cb6e1-b800-4e88-aea2-1ef397b652b3', '$argon2id$v=19$m=65536,t=3,p=4$OGaddLANypmlT4tLAKZ4cQ$6mpWBlSxxuauANSSmi+8Hcf2qj0Ge/2coOPYUovBPzQ', NULL, '::1', '2026-09-11 17:48:00.237', NULL, '2026-09-04 17:48:00.239');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('4736b3e5-7024-432d-9d1e-ed8ff2f77d10', '6d5c28e3-25ea-433d-96f7-fc2a2e5b6b8a', '$argon2id$v=19$m=65536,t=3,p=4$iU0e9LfnFSNZ38gxl3w+TA$W7ow48JN45QBUKlKvwW2SifwDK1m3J9OOEOHfx0zJLI', NULL, '::1', '2026-09-11 18:05:46.49', NULL, '2026-09-04 18:05:46.492');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('56cc0d43-5e1a-48a3-baaf-0c24ba428d71', '1b0cb6e1-b800-4e88-aea2-1ef397b652b3', '$argon2id$v=19$m=65536,t=3,p=4$654G0E0JBl9ujFnc//WI4Q$y78LlzNIFjYdwn+RxYGeJU/U5WVYFqNjRBh77NgXdeE', NULL, '::1', '2026-09-11 17:48:00.246', '2026-09-04 17:48:15.018', '2026-09-04 17:48:00.247');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('f9891f64-c263-49f2-848b-004d8e7aef80', '1b0cb6e1-b800-4e88-aea2-1ef397b652b3', '$argon2id$v=19$m=65536,t=3,p=4$ukXu7nU1Hfu8wXrOtANlQw$aubR0JJ0bf5guALkuiNJdWSa2pVBKJdsdbQiPkLHSZI', NULL, '::1', '2026-09-11 17:48:15.369', NULL, '2026-09-04 17:48:15.371');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('ab615025-c670-405a-bb36-43d9e597a078', '1b0cb6e1-b800-4e88-aea2-1ef397b652b3', '$argon2id$v=19$m=65536,t=3,p=4$qicuCwRZ2GNLcl6pI3bG4g$G8Gnum8tQyGU26sYvaYpzP+GTpNhVGiU8592PorZY7o', NULL, '::1', '2026-09-11 17:48:15.367', '2026-09-04 17:48:25.242', '2026-09-04 17:48:15.37');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('4f418186-4c91-4ea0-8e5a-2d7158aec195', '1b0cb6e1-b800-4e88-aea2-1ef397b652b3', '$argon2id$v=19$m=65536,t=3,p=4$YiYBJCocaU3yp4nDDPOkOg$TD5rG0RFfEJkM7Pubj+hiuhXtFYinTVk8keBvgWGTBo', NULL, '::1', '2026-09-11 17:48:25.6', NULL, '2026-09-04 17:48:25.602');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('36d6c727-d0c3-49ea-9fe2-75dd404c79a5', '6d5c28e3-25ea-433d-96f7-fc2a2e5b6b8a', '$argon2id$v=19$m=65536,t=3,p=4$bBs3Yjb36NOvDvnijLQaaw$4m2StsNoqV7JntkIBy7cY0ckciRC6+HcL9ikh7iWeVg', NULL, '::1', '2026-09-11 18:14:42.894', NULL, '2026-09-04 18:14:42.896');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('e5b3ea58-abaf-4a96-bb7d-b9aeba6bba39', '1b0cb6e1-b800-4e88-aea2-1ef397b652b3', '$argon2id$v=19$m=65536,t=3,p=4$DrlYjzBOxIGOG00wg+xA+A$kFRXUnPeQmUemUeT3HGcO90Za6klbxYAsRQZCB8lovM', NULL, '::1', '2026-09-11 17:48:25.6', '2026-09-04 17:55:37.177', '2026-09-04 17:48:25.602');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('d5ec1985-b991-4fab-a6f8-9aa11dfa6f01', '1b0cb6e1-b800-4e88-aea2-1ef397b652b3', '$argon2id$v=19$m=65536,t=3,p=4$Qr/f0R2wfZ/XtqX/H4CY0Q$9YdvRUFCBfbrytC8aH3Z7r7VxrjS/3w5O4gCETqFPOk', NULL, '::1', '2026-09-11 17:55:37.569', NULL, '2026-09-04 17:55:37.571');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('6ef01e0d-54ce-481b-97aa-74ad2c8c0d67', '3fcda805-31ba-4596-af43-a3d57babf0d8', '$argon2id$v=19$m=65536,t=3,p=4$cC93a3lA9cbuGZi8+ABR5w$Qsy33S0SNafD/n0qD1jV9kYZODmkkhnrHsV9UNIRsoE', NULL, '::1', '2026-09-11 17:55:42.404', NULL, '2026-09-04 17:55:42.406');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('9abbfc46-9906-4e7e-a29b-0031396adc8b', '6d5c28e3-25ea-433d-96f7-fc2a2e5b6b8a', '$argon2id$v=19$m=65536,t=3,p=4$ThXLfpgmWtYp/LDOpgjFcA$BVkwR0K6tYyIG2OT6Hg4yG6mruoHnoHevIgaw6DIGkw', NULL, '::1', '2026-09-11 17:55:49.523', NULL, '2026-09-04 17:55:49.524');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('b402eea7-71e6-4513-8776-59dc8954b4e5', '3fcda805-31ba-4596-af43-a3d57babf0d8', '$argon2id$v=19$m=65536,t=3,p=4$5w6We62yol6Z95HM2w3W+A$fQW0cf9zGEfgoH3UHzrxddePokAHoFl0bo+V/OVRphg', NULL, '::1', '2026-09-11 17:57:11.045', '2026-09-04 18:20:44.376', '2026-09-04 17:57:11.048');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('966027e0-47ae-4a2d-8177-aa9b9388ef13', '3fcda805-31ba-4596-af43-a3d57babf0d8', '$argon2id$v=19$m=65536,t=3,p=4$GSC31xY+SViTXspl6Gvu5w$/ZjEzBoVKRNAgydpRuA9hrB4jwVNz4omAb5gV9EQJw4', NULL, '::1', '2026-09-11 17:55:42.406', '2026-09-04 17:57:10.773', '2026-09-04 17:55:42.408');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('a344d79b-471c-45da-8211-8657226fa436', '3fcda805-31ba-4596-af43-a3d57babf0d8', '$argon2id$v=19$m=65536,t=3,p=4$nFCrX5qljl9RloJI/fj/YA$u8yOezmPgx6kydI//RhQyz6zbKZpRA99rFxFhlx/lNc', NULL, '::1', '2026-09-11 17:57:11.044', NULL, '2026-09-04 17:57:11.046');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('91a24706-8cc4-4406-8db0-78c16e86cc61', '6d5c28e3-25ea-433d-96f7-fc2a2e5b6b8a', '$argon2id$v=19$m=65536,t=3,p=4$ELVK9T3/TVz6gVgVVaIqFQ$toMFsOL6PBBvEkiUEeZV/MqVwJuslDtf1JfL+GD9Uvs', NULL, '::1', '2026-09-11 18:05:46.493', '2026-09-04 18:20:32.439', '2026-09-04 18:05:46.495');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('906830b5-03cf-4192-b84f-ddd9fe7da5b1', '1b0cb6e1-b800-4e88-aea2-1ef397b652b3', '$argon2id$v=19$m=65536,t=3,p=4$3ig54+EW25ych+1JgqFUSw$sIxpMBFW9gMgcyLAUfEZ5WdwgjZstyM/uvZPmofRCmI', NULL, '::1', '2026-09-11 17:55:37.578', '2026-09-04 18:02:07.277', '2026-09-04 17:55:37.579');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('cc8fba3e-811d-4582-a4ab-bec4c80cfe02', '1b0cb6e1-b800-4e88-aea2-1ef397b652b3', '$argon2id$v=19$m=65536,t=3,p=4$ILegkqcSHI1mkjQry3/EdA$rwEDjh3l1M1L0/F+kOFuhz9fsi3YcGeiypOXVYysTUY', NULL, '::1', '2026-09-11 18:02:07.613', NULL, '2026-09-04 18:02:07.615');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('63d059ce-278f-44aa-a9e0-fc95cc0bd599', '6d5c28e3-25ea-433d-96f7-fc2a2e5b6b8a', '$argon2id$v=19$m=65536,t=3,p=4$A7ORYrX0XnqY8zdKL6Fbdg$tovwB4hHz0IeS8IuB5bJMuEfPxO7sZ0VvVcO0G5V1Yc', NULL, '::1', '2026-09-11 18:20:32.746', NULL, '2026-09-04 18:20:32.748');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('ba57b14b-146c-4fd3-87c6-b0034b08f15c', '3fcda805-31ba-4596-af43-a3d57babf0d8', '$argon2id$v=19$m=65536,t=3,p=4$3C9BxqQIkXQ+wBEj6ncPUA$05L2T9fPfM5IPitZTYw2qbnqjKOwJoGqSZj4PHqGdw4', NULL, '::1', '2026-09-11 18:20:45.131', NULL, '2026-09-04 18:20:45.132');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('514816b0-192a-4e15-b596-98d728e85675', '1b0cb6e1-b800-4e88-aea2-1ef397b652b3', '$argon2id$v=19$m=65536,t=3,p=4$KV39sXK1RznyK0aIi33plA$Q78520nXXHunBws6Aix2iRyGotkI5MrgiwpfUInAK5M', NULL, '::1', '2026-09-11 18:02:07.617', '2026-09-04 18:20:33.99', '2026-09-04 18:02:07.618');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('961ac4f0-d374-441d-84b8-f5ef710d6fc3', '1b0cb6e1-b800-4e88-aea2-1ef397b652b3', '$argon2id$v=19$m=65536,t=3,p=4$bsTidp2FUUTy8TL4QGivPA$CXX4BUQ9mvW4iNue4glNt+i3lWXBCG/3I8WDnMxcPoU', NULL, '::1', '2026-09-11 18:20:34.084', NULL, '2026-09-04 18:20:34.095');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('902c4edd-354d-421c-8288-4994d9195cf2', '1b0cb6e1-b800-4e88-aea2-1ef397b652b3', '$argon2id$v=19$m=65536,t=3,p=4$0p++3aV+JSSty+dczjMZ/w$V5mLV3B12gOUTUMc1fWpFP7p6RpQq8i6nY9uyYmO+7o', NULL, '::1', '2026-09-11 18:20:34.475', NULL, '2026-09-04 18:20:34.477');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('423b5d0a-ea83-46db-a3ae-a5fd1ba91e61', '3fcda805-31ba-4596-af43-a3d57babf0d8', '$argon2id$v=19$m=65536,t=3,p=4$rWP7HCNzn+hGBhiVmDfKtQ$Gtq2eg8oH8TGplWHDUIHs6Jd/GUbiHI5WEecqRUjrvc', NULL, '::1', '2026-09-11 18:20:45.163', NULL, '2026-09-04 18:20:45.164');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('533e382c-f2ec-404f-86bc-7fea50719f00', '6d5c28e3-25ea-433d-96f7-fc2a2e5b6b8a', '$argon2id$v=19$m=65536,t=3,p=4$y0s0SKMcSpM3hEtK/ZjABg$R+l+ba2AlPejQ9P5btoqCpOGB5kg2oCGkKzsa0UO7JA', NULL, '::1', '2026-09-11 18:24:15.126', '2026-09-05 02:41:10.086', '2026-09-04 18:24:15.128');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('ca43c22b-7ab2-4a0a-9919-2697da6bb9ec', '6d5c28e3-25ea-433d-96f7-fc2a2e5b6b8a', '$argon2id$v=19$m=65536,t=3,p=4$TJ8Opl36GNIvJJetwKK4LQ$o/MKFZvIrp99enEKKxzCKzC1ECjCr61u+Ga8h85hbfQ', NULL, '::1', '2026-09-11 18:20:33.045', '2026-09-04 18:24:14.775', '2026-09-04 18:20:33.048');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('e581b93f-264e-476d-9967-78b22abeae49', '6d5c28e3-25ea-433d-96f7-fc2a2e5b6b8a', '$argon2id$v=19$m=65536,t=3,p=4$MT/oEb6Qg06tDcsML0cpNg$vGAn7qdAxpZKrpYyzp5G3kf7Hf1HMQs1+8R9ZlXhXUw', NULL, '::1', '2026-09-11 18:24:14.983', NULL, '2026-09-04 18:24:14.985');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('31c73887-fc83-4f56-8972-e5beb7ff1153', '6d5c28e3-25ea-433d-96f7-fc2a2e5b6b8a', '$argon2id$v=19$m=65536,t=3,p=4$p3du4OQevvSRUHqnuYVvRg$LQjWp/07c5pK2hBXOVYC2LxxO7mTDZm2gE1T0BYb7mE', NULL, '::1', '2026-09-12 02:41:10.58', NULL, '2026-09-05 02:41:10.583');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('1717fbe5-2bcb-45e6-9cb5-a30fc0019fbb', '6d5c28e3-25ea-433d-96f7-fc2a2e5b6b8a', '$argon2id$v=19$m=65536,t=3,p=4$q9mtHTyCv/HgIIpY+ipqFA$GOAh2f8fDXrqcnSBQNzqXq8t7Sc9+ARfCR/0iQaM4dM', NULL, '::1', '2026-09-12 02:41:10.577', '2026-09-05 03:29:07.35', '2026-09-05 02:41:10.58');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('3b5265a3-59ae-4944-bfde-54aa9666adbf', '6d5c28e3-25ea-433d-96f7-fc2a2e5b6b8a', '$argon2id$v=19$m=65536,t=3,p=4$srSMrWi4JcwQGdYXz4d6OA$m3myCjDFExlz+71RXGxTx0dc2/CqqQNSrM0tGs4hWmE', NULL, '::1', '2026-09-12 03:29:07.809', NULL, '2026-09-05 03:29:07.811');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('a6c59d1d-eba3-4bf4-b9f3-fdc4f73e965f', '6d5c28e3-25ea-433d-96f7-fc2a2e5b6b8a', '$argon2id$v=19$m=65536,t=3,p=4$ZpAy+2/usotRc4+u2PR3aQ$dXslL7GKMGCtmFi17UqU4Kr7m5mZX9aCJpY7jqbMfYs', NULL, '::1', '2026-09-12 03:29:07.862', '2026-09-05 03:58:15.57', '2026-09-05 03:29:07.864');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('a84ea557-67b4-40fa-a4bc-380103af3dd4', '6d5c28e3-25ea-433d-96f7-fc2a2e5b6b8a', '$argon2id$v=19$m=65536,t=3,p=4$CGmE74yUb9D2LhiXemulMQ$JE4bdymn8YCsE78EeS8rPeofPOYB9tPlx2vLej9YEos', NULL, '::1', '2026-09-12 03:58:16.445', NULL, '2026-09-05 03:58:16.447');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('64404b97-6bc6-47fa-8630-595b758b58c2', '6d5c28e3-25ea-433d-96f7-fc2a2e5b6b8a', '$argon2id$v=19$m=65536,t=3,p=4$3stVGz0j9rJJsBaabowELA$sFNeJE2FgIitkJamOXJ9NXecofAMcykVw+hI8o2XVv4', NULL, '::1', '2026-09-12 03:58:16.52', '2026-09-05 04:01:47.423', '2026-09-05 03:58:16.522');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('f0f84b7b-66a5-41e3-bff3-f37f45da82c8', '6d5c28e3-25ea-433d-96f7-fc2a2e5b6b8a', '$argon2id$v=19$m=65536,t=3,p=4$OT8U1HYfq3Ykc0NU7mlNlw$bKSCXLjUGI9pS47erJDGcIbyfvYe/AMd/FHvjMJRa9M', NULL, '::1', '2026-09-12 04:01:47.863', NULL, '2026-09-05 04:01:47.865');
INSERT INTO public."RefreshToken" (id, "userId", "tokenHash", "deviceInfo", "ipAddress", "expiresAt", "revokedAt", "createdAt") VALUES ('9a8ff926-11c1-4d3d-9d42-f6778a51ff1c', '6d5c28e3-25ea-433d-96f7-fc2a2e5b6b8a', '$argon2id$v=19$m=65536,t=3,p=4$N5/hHbQPHO8iGwTyeHuorA$viDU2wrl8yWPTGivh9v/JvN2dUQCd8kZ1er1iaA6c/4', NULL, '::1', '2026-09-12 04:01:48.024', NULL, '2026-09-05 04:01:48.026');


ALTER TABLE public."RefreshToken" ENABLE TRIGGER ALL;

--
-- Data for Name: Role; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public."Role" DISABLE TRIGGER ALL;

INSERT INTO public."Role" (id, "organizationId", name, "displayName", description, "isSystem", "createdAt", "updatedAt") VALUES ('9191cb07-0ff9-4fba-a2e6-a8da780db1f9', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', 'SUPER_ADMIN', 'Super Administrator', NULL, true, '2026-09-03 15:18:11.971', '2026-09-03 15:18:11.971');
INSERT INTO public."Role" (id, "organizationId", name, "displayName", description, "isSystem", "createdAt", "updatedAt") VALUES ('7fce7d0f-cc4e-460b-8b94-f313416cda8c', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', 'ORG_ADMIN', 'School Principal', NULL, true, '2026-09-03 15:18:12.217', '2026-09-03 15:18:12.217');
INSERT INTO public."Role" (id, "organizationId", name, "displayName", description, "isSystem", "createdAt", "updatedAt") VALUES ('62a0f84b-c2f4-492c-8131-69d89b98795b', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', 'TEACHER', 'Teacher / Guide', NULL, true, '2026-09-03 15:18:12.386', '2026-09-03 15:18:12.386');
INSERT INTO public."Role" (id, "organizationId", name, "displayName", description, "isSystem", "createdAt", "updatedAt") VALUES ('12980534-f171-4218-bad6-b9e819b3f7d7', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', 'PARENT', 'Parent / Guardian', NULL, true, '2026-09-03 15:18:12.477', '2026-09-03 15:18:12.477');
INSERT INTO public."Role" (id, "organizationId", name, "displayName", description, "isSystem", "createdAt", "updatedAt") VALUES ('70d3ee81-5d0a-452f-bb0e-96d9d7d0978e', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', 'STUDENT', 'Student', NULL, true, '2026-09-03 15:18:12.636', '2026-09-03 15:18:12.636');
INSERT INTO public."Role" (id, "organizationId", name, "displayName", description, "isSystem", "createdAt", "updatedAt") VALUES ('6d83a4af-2168-4966-81ed-e72840e29600', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', 'FINANCE_STAFF', 'Finance Staff', NULL, true, '2026-09-03 15:18:12.689', '2026-09-03 15:18:12.689');
INSERT INTO public."Role" (id, "organizationId", name, "displayName", description, "isSystem", "createdAt", "updatedAt") VALUES ('db6aff62-2bb2-4e37-aecd-12ca106ad26b', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', 'HR_STAFF', 'HR Staff', NULL, true, '2026-09-03 15:18:12.785', '2026-09-03 15:18:12.785');
INSERT INTO public."Role" (id, "organizationId", name, "displayName", description, "isSystem", "createdAt", "updatedAt") VALUES ('fed41f57-ec9e-4c2d-9395-1c3f92b00538', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', 'FRONT_DESK', 'Front Desk', NULL, true, '2026-09-03 15:18:12.841', '2026-09-03 15:18:12.841');


ALTER TABLE public."Role" ENABLE TRIGGER ALL;

--
-- Data for Name: RolePermission; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public."RolePermission" DISABLE TRIGGER ALL;

INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt") VALUES ('18efb6d9-1e00-4735-b935-56426909f71a', '9191cb07-0ff9-4fba-a2e6-a8da780db1f9', 'd865ab8a-055a-4b17-ba60-8ee3eef953ee', '2026-09-03 15:18:11.993');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt") VALUES ('e4147506-d6a4-4ca2-92e3-9a827786620e', '9191cb07-0ff9-4fba-a2e6-a8da780db1f9', '9b21fb56-e244-481a-854d-905f5d8e8458', '2026-09-03 15:18:12.018');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt") VALUES ('4b0f3a18-0801-46fc-8155-a2ade35dc1fb', '9191cb07-0ff9-4fba-a2e6-a8da780db1f9', 'a046a34c-5095-4f05-acdd-948acd710d20', '2026-09-03 15:18:12.024');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt") VALUES ('053012f5-d1ca-49d6-a6e9-661599e486f6', '9191cb07-0ff9-4fba-a2e6-a8da780db1f9', '75206990-d580-45b0-8301-a254fe44af30', '2026-09-03 15:18:12.035');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt") VALUES ('61e41bd2-7fb1-4d75-b9cf-67d5e043a423', '9191cb07-0ff9-4fba-a2e6-a8da780db1f9', '6cbda140-dd98-473f-a4ac-0567d5c90149', '2026-09-03 15:18:12.05');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt") VALUES ('490bf640-0b64-4e22-8cb7-aa24fe5924fe', '9191cb07-0ff9-4fba-a2e6-a8da780db1f9', 'dfc018d9-18d5-4bca-9015-0b73b7f6d650', '2026-09-03 15:18:12.062');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt") VALUES ('dca1f105-044a-475f-9a97-51c98ddf3fe5', '9191cb07-0ff9-4fba-a2e6-a8da780db1f9', 'baf6c9af-2396-4147-9f13-c2dbc67d2ac7', '2026-09-03 15:18:12.069');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt") VALUES ('637f1b32-d07f-4243-a5c9-903cc789aeef', '9191cb07-0ff9-4fba-a2e6-a8da780db1f9', '45cf1e37-4652-4f5d-8a9a-5922acd2a933', '2026-09-03 15:18:12.074');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt") VALUES ('5806d2c0-45ca-4947-bf64-3b06eab3b0a4', '9191cb07-0ff9-4fba-a2e6-a8da780db1f9', 'f787486b-3a41-4004-beca-af8b1b0d582f', '2026-09-03 15:18:12.083');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt") VALUES ('5ec1a347-ef1f-45e2-b657-9da0de5e13be', '9191cb07-0ff9-4fba-a2e6-a8da780db1f9', 'e569980d-43df-4cdc-a364-065d20ce3ba5', '2026-09-03 15:18:12.088');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt") VALUES ('12955ea3-56ca-417a-9c6f-9a0f8022a6e1', '9191cb07-0ff9-4fba-a2e6-a8da780db1f9', '6e582f86-2245-4027-81d4-9da606319221', '2026-09-03 15:18:12.093');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt") VALUES ('bc899575-7b75-417f-bcbc-0a316761262b', '9191cb07-0ff9-4fba-a2e6-a8da780db1f9', '55e783d9-ff18-4dc1-baa6-76ccd49c67cd', '2026-09-03 15:18:12.1');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt") VALUES ('9c123197-6930-42d9-bf56-20203b677f05', '9191cb07-0ff9-4fba-a2e6-a8da780db1f9', '22148bed-7fd5-45f5-81da-f5bc975ea5c3', '2026-09-03 15:18:12.109');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt") VALUES ('85515f5c-97d7-4795-9b6b-ad97352501da', '9191cb07-0ff9-4fba-a2e6-a8da780db1f9', '9b087187-6d43-4947-870e-7aadf3118cf3', '2026-09-03 15:18:12.117');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt") VALUES ('a671129e-29d7-4f33-82ab-3bf0079aadb6', '9191cb07-0ff9-4fba-a2e6-a8da780db1f9', '88de0ba1-43bb-4876-938c-12d8f3e56f71', '2026-09-03 15:18:12.132');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt") VALUES ('97bc8eb7-cc63-46d5-bc1e-095593190a44', '9191cb07-0ff9-4fba-a2e6-a8da780db1f9', 'de495740-e554-44b2-af08-473bc88980e5', '2026-09-03 15:18:12.139');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt") VALUES ('4749c700-fc0d-4641-b798-df230d226140', '9191cb07-0ff9-4fba-a2e6-a8da780db1f9', 'd95f9d5b-3643-4a6d-ad51-2aeee7f6dfb3', '2026-09-03 15:18:12.144');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt") VALUES ('aedc3e37-bb65-4a0f-be64-ea8fc7908f84', '9191cb07-0ff9-4fba-a2e6-a8da780db1f9', '9f3e9bc1-1593-40e6-9567-ffceb5b85e2e', '2026-09-03 15:18:12.15');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt") VALUES ('87b137da-3d61-48ae-8ba3-0698daf44b39', '9191cb07-0ff9-4fba-a2e6-a8da780db1f9', 'eff49c58-8be8-4f27-ab60-f59302667ab3', '2026-09-03 15:18:12.155');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt") VALUES ('03c72296-31fc-4a4b-85be-6142dec27ba2', '9191cb07-0ff9-4fba-a2e6-a8da780db1f9', 'dde74577-c84a-4675-950c-4d91d89d7e27', '2026-09-03 15:18:12.159');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt") VALUES ('86b970a9-a8bd-4188-9f80-ad8924b7adb3', '9191cb07-0ff9-4fba-a2e6-a8da780db1f9', 'fa19f06e-9d44-4128-b9cb-54665754c8aa', '2026-09-03 15:18:12.167');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt") VALUES ('77e835d7-ad6d-47dd-8573-9a2053502c2d', '9191cb07-0ff9-4fba-a2e6-a8da780db1f9', 'ec1815e4-ce8a-4fb0-be9a-198b368af074', '2026-09-03 15:18:12.175');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt") VALUES ('a626067c-34ea-424d-b061-39b30c9aa482', '9191cb07-0ff9-4fba-a2e6-a8da780db1f9', 'cf732301-008f-4929-abf5-9cf88c1100f1', '2026-09-03 15:18:12.184');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt") VALUES ('5d829880-eea3-4bd6-8452-9af35f6ee85e', '9191cb07-0ff9-4fba-a2e6-a8da780db1f9', '6a73acb5-3373-4e28-82f1-e80e27e8614e', '2026-09-03 15:18:12.189');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt") VALUES ('db2b5082-d743-4d53-81e3-07cfb3fa5b76', '9191cb07-0ff9-4fba-a2e6-a8da780db1f9', '7f1b31e8-2daf-4920-9572-af341bc31dc2', '2026-09-03 15:18:12.201');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt") VALUES ('10af5ea8-5e6c-4a76-8a70-5993b11698c6', '9191cb07-0ff9-4fba-a2e6-a8da780db1f9', '9fb6d25e-0477-47b1-8a2f-cf61a8a511c0', '2026-09-03 15:18:12.205');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt") VALUES ('6b4bc1bc-4adc-4b81-af9a-c61ff9bb8850', '9191cb07-0ff9-4fba-a2e6-a8da780db1f9', 'ad3fa95c-c6ed-40d5-bce0-13d66113ec4e', '2026-09-03 15:18:12.21');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt") VALUES ('fe2f9350-2d6d-4262-8049-6115b68ca21d', '7fce7d0f-cc4e-460b-8b94-f313416cda8c', 'd865ab8a-055a-4b17-ba60-8ee3eef953ee', '2026-09-03 15:18:12.224');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt") VALUES ('ed6896a0-e9e5-4677-a250-672ed8419b77', '7fce7d0f-cc4e-460b-8b94-f313416cda8c', '9b21fb56-e244-481a-854d-905f5d8e8458', '2026-09-03 15:18:12.232');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt") VALUES ('4e116b1d-7be4-49c0-982d-3e0359c28e9b', '7fce7d0f-cc4e-460b-8b94-f313416cda8c', 'a046a34c-5095-4f05-acdd-948acd710d20', '2026-09-03 15:18:12.237');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt") VALUES ('4f200f8c-42a0-4afb-a867-9c5598be6f0f', '7fce7d0f-cc4e-460b-8b94-f313416cda8c', '75206990-d580-45b0-8301-a254fe44af30', '2026-09-03 15:18:12.242');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt") VALUES ('613d9cba-451e-4c8c-b5fc-05a74a544b3e', '7fce7d0f-cc4e-460b-8b94-f313416cda8c', '6cbda140-dd98-473f-a4ac-0567d5c90149', '2026-09-03 15:18:12.249');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt") VALUES ('26b90ac2-19b1-4f0e-b57c-f19f281d0d7f', '7fce7d0f-cc4e-460b-8b94-f313416cda8c', 'dfc018d9-18d5-4bca-9015-0b73b7f6d650', '2026-09-03 15:18:12.254');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt") VALUES ('1021d2fd-f289-41ce-a92d-ae2a5dca2a7d', '7fce7d0f-cc4e-460b-8b94-f313416cda8c', 'baf6c9af-2396-4147-9f13-c2dbc67d2ac7', '2026-09-03 15:18:12.26');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt") VALUES ('1f8fae39-59ee-4654-9c5f-13d1ab6a20a6', '7fce7d0f-cc4e-460b-8b94-f313416cda8c', '45cf1e37-4652-4f5d-8a9a-5922acd2a933', '2026-09-03 15:18:12.269');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt") VALUES ('25deb6af-abc7-4a27-bc3f-03a64f1cad14', '7fce7d0f-cc4e-460b-8b94-f313416cda8c', 'f787486b-3a41-4004-beca-af8b1b0d582f', '2026-09-03 15:18:12.274');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt") VALUES ('67c2fed1-43f6-45dd-9237-5bc61d16f564', '7fce7d0f-cc4e-460b-8b94-f313416cda8c', 'e569980d-43df-4cdc-a364-065d20ce3ba5', '2026-09-03 15:18:12.281');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt") VALUES ('6b6e7e10-6466-4fe0-ba7e-592217fdafe8', '7fce7d0f-cc4e-460b-8b94-f313416cda8c', '6e582f86-2245-4027-81d4-9da606319221', '2026-09-03 15:18:12.287');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt") VALUES ('4e6af04b-ebe6-4665-9a21-cb645c92f70e', '7fce7d0f-cc4e-460b-8b94-f313416cda8c', '55e783d9-ff18-4dc1-baa6-76ccd49c67cd', '2026-09-03 15:18:12.292');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt") VALUES ('0e05bee1-6630-427f-a7d6-1e01f619e124', '7fce7d0f-cc4e-460b-8b94-f313416cda8c', '22148bed-7fd5-45f5-81da-f5bc975ea5c3', '2026-09-03 15:18:12.3');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt") VALUES ('8df286a6-419a-4966-bf0d-79903c8b177f', '7fce7d0f-cc4e-460b-8b94-f313416cda8c', '9b087187-6d43-4947-870e-7aadf3118cf3', '2026-09-03 15:18:12.305');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt") VALUES ('09a346ca-821f-4046-ae46-1e7899a0bb7a', '7fce7d0f-cc4e-460b-8b94-f313416cda8c', '88de0ba1-43bb-4876-938c-12d8f3e56f71', '2026-09-03 15:18:12.31');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt") VALUES ('c08a777a-ebe5-43cb-9a19-dbef307be87e', '7fce7d0f-cc4e-460b-8b94-f313416cda8c', 'de495740-e554-44b2-af08-473bc88980e5', '2026-09-03 15:18:12.318');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt") VALUES ('152621b8-21d7-4131-bb90-9a9a900ffa0b', '7fce7d0f-cc4e-460b-8b94-f313416cda8c', 'd95f9d5b-3643-4a6d-ad51-2aeee7f6dfb3', '2026-09-03 15:18:12.323');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt") VALUES ('ac6bf726-ff93-4ced-85eb-62da3fd230bb', '7fce7d0f-cc4e-460b-8b94-f313416cda8c', '9f3e9bc1-1593-40e6-9567-ffceb5b85e2e', '2026-09-03 15:18:12.331');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt") VALUES ('15a225c6-7252-45d5-8886-0ebd893efd29', '7fce7d0f-cc4e-460b-8b94-f313416cda8c', 'eff49c58-8be8-4f27-ab60-f59302667ab3', '2026-09-03 15:18:12.337');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt") VALUES ('222f55f3-b2bb-486d-b439-1e5b403a7c4d', '7fce7d0f-cc4e-460b-8b94-f313416cda8c', 'dde74577-c84a-4675-950c-4d91d89d7e27', '2026-09-03 15:18:12.342');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt") VALUES ('38931801-2d33-4a56-8da3-5fd662f390c6', '7fce7d0f-cc4e-460b-8b94-f313416cda8c', 'fa19f06e-9d44-4128-b9cb-54665754c8aa', '2026-09-03 15:18:12.35');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt") VALUES ('7ac65d3a-f423-4478-bf7f-a76de5a5e8d5', '7fce7d0f-cc4e-460b-8b94-f313416cda8c', 'ec1815e4-ce8a-4fb0-be9a-198b368af074', '2026-09-03 15:18:12.355');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt") VALUES ('09482771-ea24-4b08-ab4f-a5e168fcc072', '7fce7d0f-cc4e-460b-8b94-f313416cda8c', '6a73acb5-3373-4e28-82f1-e80e27e8614e', '2026-09-03 15:18:12.36');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt") VALUES ('5bffd220-34bb-49b3-ba80-06a1f46fd63e', '7fce7d0f-cc4e-460b-8b94-f313416cda8c', '7f1b31e8-2daf-4920-9572-af341bc31dc2', '2026-09-03 15:18:12.367');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt") VALUES ('a79b95f4-5940-4a1d-b4a6-0c9b58888bc7', '7fce7d0f-cc4e-460b-8b94-f313416cda8c', '9fb6d25e-0477-47b1-8a2f-cf61a8a511c0', '2026-09-03 15:18:12.372');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt") VALUES ('caafb0d0-ca41-4746-b9b1-362db0317f6a', '7fce7d0f-cc4e-460b-8b94-f313416cda8c', 'ad3fa95c-c6ed-40d5-bce0-13d66113ec4e', '2026-09-03 15:18:12.377');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt") VALUES ('5e9ec11a-bc7b-449b-b3e1-6e9ff2b65b01', '62a0f84b-c2f4-492c-8131-69d89b98795b', 'd865ab8a-055a-4b17-ba60-8ee3eef953ee', '2026-09-03 15:18:12.393');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt") VALUES ('8accbdee-eecf-4d6b-b82f-be023d437b82', '62a0f84b-c2f4-492c-8131-69d89b98795b', '75206990-d580-45b0-8301-a254fe44af30', '2026-09-03 15:18:12.399');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt") VALUES ('10175db4-1558-45e2-92db-fc35b76763e1', '62a0f84b-c2f4-492c-8131-69d89b98795b', '6cbda140-dd98-473f-a4ac-0567d5c90149', '2026-09-03 15:18:12.406');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt") VALUES ('3f8e8b44-0230-4224-b2d1-a8ad64852162', '62a0f84b-c2f4-492c-8131-69d89b98795b', 'dfc018d9-18d5-4bca-9015-0b73b7f6d650', '2026-09-03 15:18:12.419');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt") VALUES ('d95431b1-5fc5-4b3b-9bb4-f4498e64b20c', '62a0f84b-c2f4-492c-8131-69d89b98795b', 'baf6c9af-2396-4147-9f13-c2dbc67d2ac7', '2026-09-03 15:18:12.424');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt") VALUES ('44e820b7-6188-4f60-b53d-67e78c16d2ee', '62a0f84b-c2f4-492c-8131-69d89b98795b', '45cf1e37-4652-4f5d-8a9a-5922acd2a933', '2026-09-03 15:18:12.431');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt") VALUES ('4778f602-761d-4e54-886f-06cf46a48781', '62a0f84b-c2f4-492c-8131-69d89b98795b', 'f787486b-3a41-4004-beca-af8b1b0d582f', '2026-09-03 15:18:12.437');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt") VALUES ('c67ebaf7-1f83-4893-bee1-4f622c397058', '62a0f84b-c2f4-492c-8131-69d89b98795b', 'd95f9d5b-3643-4a6d-ad51-2aeee7f6dfb3', '2026-09-03 15:18:12.442');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt") VALUES ('aa530d0d-e72d-4c16-9421-940836d43b2b', '62a0f84b-c2f4-492c-8131-69d89b98795b', 'eff49c58-8be8-4f27-ab60-f59302667ab3', '2026-09-03 15:18:12.451');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt") VALUES ('1921c29e-1d0f-433d-bdf2-81b5fe3425cc', '62a0f84b-c2f4-492c-8131-69d89b98795b', 'dde74577-c84a-4675-950c-4d91d89d7e27', '2026-09-03 15:18:12.458');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt") VALUES ('7a4c2ecc-9f06-40e6-9965-14e993b898bf', '62a0f84b-c2f4-492c-8131-69d89b98795b', '9fb6d25e-0477-47b1-8a2f-cf61a8a511c0', '2026-09-03 15:18:12.467');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt") VALUES ('b60dda8e-7a1d-4b98-9d80-2d5702416bf3', '62a0f84b-c2f4-492c-8131-69d89b98795b', 'ad3fa95c-c6ed-40d5-bce0-13d66113ec4e', '2026-09-03 15:18:12.472');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt") VALUES ('61e29ce9-4328-47ed-aeb4-8ce158c34c73', '12980534-f171-4218-bad6-b9e819b3f7d7', 'd865ab8a-055a-4b17-ba60-8ee3eef953ee', '2026-09-03 15:18:12.486');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt") VALUES ('c730688c-75ce-47fc-8f5d-05a9358d14cb', '12980534-f171-4218-bad6-b9e819b3f7d7', '75206990-d580-45b0-8301-a254fe44af30', '2026-09-03 15:18:12.492');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt") VALUES ('ede42e10-b380-4feb-90ce-e04a66ddd6b1', '12980534-f171-4218-bad6-b9e819b3f7d7', '45cf1e37-4652-4f5d-8a9a-5922acd2a933', '2026-09-03 15:18:12.502');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt") VALUES ('4cd8148f-660d-4719-ad72-82547faa9a77', '12980534-f171-4218-bad6-b9e819b3f7d7', 'd95f9d5b-3643-4a6d-ad51-2aeee7f6dfb3', '2026-09-03 15:18:12.507');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt") VALUES ('6151a82c-cdfd-40a1-b860-972b97ef4c38', '12980534-f171-4218-bad6-b9e819b3f7d7', 'eff49c58-8be8-4f27-ab60-f59302667ab3', '2026-09-03 15:18:12.523');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt") VALUES ('00a52f27-fd22-4f21-a4a9-b867d6bd8326', '12980534-f171-4218-bad6-b9e819b3f7d7', 'dde74577-c84a-4675-950c-4d91d89d7e27', '2026-09-03 15:18:12.561');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt") VALUES ('eac53bf6-881a-4601-a81e-8844c660a1ad', '12980534-f171-4218-bad6-b9e819b3f7d7', '9fb6d25e-0477-47b1-8a2f-cf61a8a511c0', '2026-09-03 15:18:12.602');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt") VALUES ('f2d906ac-9394-4aad-bb29-d05bb26a5c3b', '70d3ee81-5d0a-452f-bb0e-96d9d7d0978e', 'd95f9d5b-3643-4a6d-ad51-2aeee7f6dfb3', '2026-09-03 15:18:12.658');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt") VALUES ('9d721064-0d05-4638-b6d8-e6a9d6464caa', '70d3ee81-5d0a-452f-bb0e-96d9d7d0978e', '9fb6d25e-0477-47b1-8a2f-cf61a8a511c0', '2026-09-03 15:18:12.671');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt") VALUES ('d7854e56-dcdc-4925-946f-b0728c89c1f4', '6d83a4af-2168-4966-81ed-e72840e29600', 'e569980d-43df-4cdc-a364-065d20ce3ba5', '2026-09-03 15:18:12.704');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt") VALUES ('5edd9f66-e6ca-4fd9-a523-66baff217446', '6d83a4af-2168-4966-81ed-e72840e29600', '6e582f86-2245-4027-81d4-9da606319221', '2026-09-03 15:18:12.719');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt") VALUES ('72d56c8f-4662-4200-ab57-095dee960eb4', '6d83a4af-2168-4966-81ed-e72840e29600', 'd865ab8a-055a-4b17-ba60-8ee3eef953ee', '2026-09-03 15:18:12.725');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt") VALUES ('c287c25c-96bb-4a5c-9960-98c230c0302b', '6d83a4af-2168-4966-81ed-e72840e29600', '7f1b31e8-2daf-4920-9572-af341bc31dc2', '2026-09-03 15:18:12.742');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt") VALUES ('4c7d71f2-edd2-45c3-b323-9aee9c3730a8', '6d83a4af-2168-4966-81ed-e72840e29600', 'd95f9d5b-3643-4a6d-ad51-2aeee7f6dfb3', '2026-09-03 15:18:12.756');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt") VALUES ('d8b11dd1-b62d-4f2a-b703-6075e7382721', 'db6aff62-2bb2-4e37-aecd-12ca106ad26b', '22148bed-7fd5-45f5-81da-f5bc975ea5c3', '2026-09-03 15:18:12.79');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt") VALUES ('bb6294e3-8bc0-4561-86e6-68c34f85c680', 'db6aff62-2bb2-4e37-aecd-12ca106ad26b', '9b087187-6d43-4947-870e-7aadf3118cf3', '2026-09-03 15:18:12.803');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt") VALUES ('f6b05780-e678-4b0e-83ae-26e5ad48a863', 'db6aff62-2bb2-4e37-aecd-12ca106ad26b', 'd865ab8a-055a-4b17-ba60-8ee3eef953ee', '2026-09-03 15:18:12.807');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt") VALUES ('66591279-778b-465f-9afd-938df97b7383', 'db6aff62-2bb2-4e37-aecd-12ca106ad26b', 'd95f9d5b-3643-4a6d-ad51-2aeee7f6dfb3', '2026-09-03 15:18:12.821');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt") VALUES ('de1e68c4-20a1-4d2a-be6c-7985a557553e', 'db6aff62-2bb2-4e37-aecd-12ca106ad26b', '7f1b31e8-2daf-4920-9572-af341bc31dc2', '2026-09-03 15:18:12.826');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt") VALUES ('34c0716c-ee14-435d-8d60-ef0f2b932281', 'fed41f57-ec9e-4c2d-9395-1c3f92b00538', 'd865ab8a-055a-4b17-ba60-8ee3eef953ee', '2026-09-03 15:18:12.859');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt") VALUES ('9b4a67bd-7923-4eb8-a912-f85b692f38f6', 'fed41f57-ec9e-4c2d-9395-1c3f92b00538', '75206990-d580-45b0-8301-a254fe44af30', '2026-09-03 15:18:12.877');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt") VALUES ('d2486332-2991-4689-931b-bc2a3437d641', 'fed41f57-ec9e-4c2d-9395-1c3f92b00538', '6cbda140-dd98-473f-a4ac-0567d5c90149', '2026-09-03 15:18:12.887');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt") VALUES ('ae328082-3312-4076-b166-48920c7bf3e5', 'fed41f57-ec9e-4c2d-9395-1c3f92b00538', 'd95f9d5b-3643-4a6d-ad51-2aeee7f6dfb3', '2026-09-03 15:18:12.91');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt") VALUES ('a69e007d-2594-478e-8751-970f84d868f4', 'fed41f57-ec9e-4c2d-9395-1c3f92b00538', 'eff49c58-8be8-4f27-ab60-f59302667ab3', '2026-09-03 15:18:12.921');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt") VALUES ('cc6ada21-eb64-4b87-b281-e0a644ca8cf4', '6d83a4af-2168-4966-81ed-e72840e29600', 'eff49c58-8be8-4f27-ab60-f59302667ab3', '2026-09-04 03:47:26.896');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt") VALUES ('d7fb9e44-9ab6-41ce-8a31-c2b72130b3a6', 'db6aff62-2bb2-4e37-aecd-12ca106ad26b', 'eff49c58-8be8-4f27-ab60-f59302667ab3', '2026-09-04 03:47:26.917');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt") VALUES ('993b40b5-0d5b-422c-b4c9-fdbae4b55382', '6d83a4af-2168-4966-81ed-e72840e29600', '22148bed-7fd5-45f5-81da-f5bc975ea5c3', '2026-09-04 18:04:48.338');
INSERT INTO public."RolePermission" (id, "roleId", "permissionId", "createdAt") VALUES ('f2e4bacf-d7cc-4b04-bccf-bfc3f52e9f12', '6d83a4af-2168-4966-81ed-e72840e29600', '9b087187-6d43-4947-870e-7aadf3118cf3', '2026-09-04 18:04:48.368');


ALTER TABLE public."RolePermission" ENABLE TRIGGER ALL;

--
-- Data for Name: StaffAttendance; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public."StaffAttendance" DISABLE TRIGGER ALL;



ALTER TABLE public."StaffAttendance" ENABLE TRIGGER ALL;

--
-- Data for Name: StockMovement; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public."StockMovement" DISABLE TRIGGER ALL;

INSERT INTO public."StockMovement" (id, "organizationId", "inventoryItemId", type, quantity, "stockBefore", "stockAfter", "referenceType", "referenceId", notes, "performedByUserId", "createdAt") VALUES ('7742e09d-8d87-4536-a534-7626b3d9508c', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', '390c39c0-43de-483f-98a6-7787b3aff0c4', 'PURCHASE', 3, 0, 3, NULL, NULL, 'Initial stock purchase', '1b0cb6e1-b800-4e88-aea2-1ef397b652b3', '2026-09-03 15:18:16.711');
INSERT INTO public."StockMovement" (id, "organizationId", "inventoryItemId", type, quantity, "stockBefore", "stockAfter", "referenceType", "referenceId", notes, "performedByUserId", "createdAt") VALUES ('5479abe3-8f8b-429a-b884-23ef8cb7fa35', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', '2f9f4d2f-997d-42a8-88dc-03d85452ce5f', 'USAGE', -4, 5, 1, NULL, NULL, 'Consumed during classroom use — letters worn', '74f06c0a-b838-4549-8b86-6a6d386ff69f', '2026-09-03 15:18:16.733');


ALTER TABLE public."StockMovement" ENABLE TRIGGER ALL;

--
-- Data for Name: Streak; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public."Streak" DISABLE TRIGGER ALL;

INSERT INTO public."Streak" (id, "studentId", type, "currentStreak", "longestStreak", "lastActivityDate", "updatedAt", "createdAt") VALUES ('93e4c404-2636-4e70-b701-16a6b6949a35', 'fa74d8a5-499c-48f3-9eff-a8e304531d8c', 'ATTENDANCE', 12, 15, '2026-09-03 15:18:16.818', '2026-09-03 15:18:16.82', '2026-09-03 15:18:16.82');
INSERT INTO public."Streak" (id, "studentId", type, "currentStreak", "longestStreak", "lastActivityDate", "updatedAt", "createdAt") VALUES ('ab72bb72-e8d1-4134-9fff-e04dd636d484', '7c968eac-81f5-44ba-bb7b-08664d16f1a9', 'ATTENDANCE', 20, 20, '2026-09-03 15:18:16.832', '2026-09-03 15:18:16.833', '2026-09-03 15:18:16.833');


ALTER TABLE public."Streak" ENABLE TRIGGER ALL;

--
-- Data for Name: StudentBadge; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public."StudentBadge" DISABLE TRIGGER ALL;

INSERT INTO public."StudentBadge" (id, "studentId", "badgeId", "milestoneId", "awardedByUserId", "awardedAt", note) VALUES ('ea773022-6829-4e39-a59d-26ed7593f708', 'fa74d8a5-499c-48f3-9eff-a8e304531d8c', 'c74406b9-c8db-4711-9c9d-271b38013856', 'e5bb87c4-6e1f-4e3b-abeb-28eb06d2a721', '74f06c0a-b838-4549-8b86-6a6d386ff69f', '2026-09-03 15:18:16.776', 'Completed full pouring cycle completely independently!');
INSERT INTO public."StudentBadge" (id, "studentId", "badgeId", "milestoneId", "awardedByUserId", "awardedAt", note) VALUES ('499a999e-3ffd-4c71-bde6-e92e3ea99ec5', '7c968eac-81f5-44ba-bb7b-08664d16f1a9', 'a5401010-88f1-477b-9daf-15706dfb9485', '3f7530e9-d722-4dd6-be4e-8ab2e45e9d3c', '74f06c0a-b838-4549-8b86-6a6d386ff69f', '2026-09-03 15:18:16.795', 'Outstanding work with the 1000-cube!');


ALTER TABLE public."StudentBadge" ENABLE TRIGGER ALL;

--
-- Data for Name: StudentGuardian; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public."StudentGuardian" DISABLE TRIGGER ALL;

INSERT INTO public."StudentGuardian" (id, "studentId", "guardianId", "isPrimary", "canPickup", "createdAt") VALUES ('6b7a46d6-3c7e-4a44-9bd6-7b011409f621', 'fa74d8a5-499c-48f3-9eff-a8e304531d8c', 'e399d53b-e233-4365-b30a-d1aeaec0012f', true, true, '2026-09-03 15:18:16.091');
INSERT INTO public."StudentGuardian" (id, "studentId", "guardianId", "isPrimary", "canPickup", "createdAt") VALUES ('37f673de-d040-48cb-b30b-e3fbb2ded7b0', 'fa74d8a5-499c-48f3-9eff-a8e304531d8c', 'e38baae9-9531-45a0-95fc-b1c1b79c1819', false, true, '2026-09-03 15:18:16.109');
INSERT INTO public."StudentGuardian" (id, "studentId", "guardianId", "isPrimary", "canPickup", "createdAt") VALUES ('f7c8f845-6540-435f-b62b-e5cc4a3a4cbe', '218e90cd-6b1e-4214-b8d1-d0813883ee1e', '99fdcf8e-b210-4200-89e1-1e072ddc2e66', true, true, '2026-09-03 15:18:16.116');


ALTER TABLE public."StudentGuardian" ENABLE TRIGGER ALL;

--
-- Data for Name: StudentProgress; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public."StudentProgress" DISABLE TRIGGER ALL;

INSERT INTO public."StudentProgress" (id, "organizationId", "studentId", "curriculumAreaId", "milestoneId", "masteryLevel", "lastUpdatedAt", "createdAt", "updatedAt") VALUES ('9ec3ab40-d706-40f5-ac33-f9889e29746e', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', 'fa74d8a5-499c-48f3-9eff-a8e304531d8c', '410af4f9-f133-4f31-91b2-95d8491a446d', 'e5bb87c4-6e1f-4e3b-abeb-28eb06d2a721', 'MASTERED', '2026-09-03 15:18:16.311', '2026-09-03 15:18:16.311', '2026-09-03 15:18:16.311');
INSERT INTO public."StudentProgress" (id, "organizationId", "studentId", "curriculumAreaId", "milestoneId", "masteryLevel", "lastUpdatedAt", "createdAt", "updatedAt") VALUES ('1c7ccb2c-a696-48ff-bb84-2284fe55dd91', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', 'fa74d8a5-499c-48f3-9eff-a8e304531d8c', '410af4f9-f133-4f31-91b2-95d8491a446d', '27280d19-659d-4746-bb91-43e4b369b999', 'PRACTICING', '2026-09-03 15:18:16.341', '2026-09-03 15:18:16.341', '2026-09-03 15:18:16.341');
INSERT INTO public."StudentProgress" (id, "organizationId", "studentId", "curriculumAreaId", "milestoneId", "masteryLevel", "lastUpdatedAt", "createdAt", "updatedAt") VALUES ('a6cc6c73-a7cf-494a-adf5-8cf1d2c8cd75', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', 'fa74d8a5-499c-48f3-9eff-a8e304531d8c', 'b4adb2c3-1e9c-41ef-bc93-64cb32a602ca', '8c2dc39b-f07a-461f-a8b6-d5f03a6d291f', 'PRACTICING', '2026-09-03 15:18:16.356', '2026-09-03 15:18:16.356', '2026-09-03 15:18:16.356');
INSERT INTO public."StudentProgress" (id, "organizationId", "studentId", "curriculumAreaId", "milestoneId", "masteryLevel", "lastUpdatedAt", "createdAt", "updatedAt") VALUES ('65a046b3-eecf-4542-abbc-416e63cc54f1', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', 'fa74d8a5-499c-48f3-9eff-a8e304531d8c', '27220259-7054-4a57-835f-45e49c95828b', '7548d2d4-99e3-44c9-a99d-d1f9266ec6f0', 'INTRODUCED', '2026-09-03 15:18:16.371', '2026-09-03 15:18:16.371', '2026-09-03 15:18:16.371');
INSERT INTO public."StudentProgress" (id, "organizationId", "studentId", "curriculumAreaId", "milestoneId", "masteryLevel", "lastUpdatedAt", "createdAt", "updatedAt") VALUES ('2722b7a5-dec8-4d40-9a29-726e1a7f22e0', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', 'fa74d8a5-499c-48f3-9eff-a8e304531d8c', '52924826-916b-4fe1-815e-e09cc3402766', '4a5a75b2-3e56-4fdf-a7ef-14a520fe0578', 'NOT_INTRODUCED', '2026-09-03 15:18:16.377', '2026-09-03 15:18:16.377', '2026-09-03 15:18:16.377');
INSERT INTO public."StudentProgress" (id, "organizationId", "studentId", "curriculumAreaId", "milestoneId", "masteryLevel", "lastUpdatedAt", "createdAt", "updatedAt") VALUES ('d0da445f-5ae6-491d-9054-b9b688b3555e', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', '218e90cd-6b1e-4214-b8d1-d0813883ee1e', '410af4f9-f133-4f31-91b2-95d8491a446d', 'e5bb87c4-6e1f-4e3b-abeb-28eb06d2a721', 'PRACTICING', '2026-09-03 15:18:16.389', '2026-09-03 15:18:16.389', '2026-09-03 15:18:16.389');
INSERT INTO public."StudentProgress" (id, "organizationId", "studentId", "curriculumAreaId", "milestoneId", "masteryLevel", "lastUpdatedAt", "createdAt", "updatedAt") VALUES ('57e64c1c-53d5-49ad-ad9d-4249bee3bca4', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', '218e90cd-6b1e-4214-b8d1-d0813883ee1e', '52924826-916b-4fe1-815e-e09cc3402766', '4a5a75b2-3e56-4fdf-a7ef-14a520fe0578', 'PRACTICING', '2026-09-03 15:18:16.406', '2026-09-03 15:18:16.406', '2026-09-03 15:18:16.406');
INSERT INTO public."StudentProgress" (id, "organizationId", "studentId", "curriculumAreaId", "milestoneId", "masteryLevel", "lastUpdatedAt", "createdAt", "updatedAt") VALUES ('a2bca4e1-2490-4589-a5f3-030b748fd799', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', '7c968eac-81f5-44ba-bb7b-08664d16f1a9', '52924826-916b-4fe1-815e-e09cc3402766', '3f7530e9-d722-4dd6-be4e-8ab2e45e9d3c', 'EXTENDING', '2026-09-03 15:18:16.412', '2026-09-03 15:18:16.412', '2026-09-03 15:18:16.412');
INSERT INTO public."StudentProgress" (id, "organizationId", "studentId", "curriculumAreaId", "milestoneId", "masteryLevel", "lastUpdatedAt", "createdAt", "updatedAt") VALUES ('34d2bc58-e2b9-4fd7-9320-a67485ad3e8d', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', '7c968eac-81f5-44ba-bb7b-08664d16f1a9', '27220259-7054-4a57-835f-45e49c95828b', 'd1d96d32-2341-44a8-bec3-e64a08228dba', 'MASTERED', '2026-09-03 15:18:16.417', '2026-09-03 15:18:16.417', '2026-09-03 15:18:16.417');


ALTER TABLE public."StudentProgress" ENABLE TRIGGER ALL;

--
-- Data for Name: SyncLog; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public."SyncLog" DISABLE TRIGGER ALL;

INSERT INTO public."SyncLog" (id, "organizationId", "syncQueueId", "deviceId", entity, "entityId", operation, resolution, "clientPayload", "serverPayload", "resolvedPayload", "resolvedByUserId", "resolvedAt", "createdAt") VALUES ('b44a5449-c9ae-4ef9-974d-f05a138bbb46', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', 'a2ba2b93-7550-4021-9341-454b063be08e', 'tablet-sunflower-01', 'Observation', 'e3e4f955-dbf3-41cf-8806-b7116b83b3e3', 'UPDATE', 'MANUAL', '{"note": "Offline edit: Alex completed pouring independently", "masteryLevel": "MASTERED"}', '{"note": "Alex completed pouring — minor spill on last attempt", "masteryLevel": "PRACTICING"}', 'null', NULL, NULL, '2026-09-03 15:18:17.01');


ALTER TABLE public."SyncLog" ENABLE TRIGGER ALL;

--
-- Data for Name: SyncQueue; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public."SyncQueue" DISABLE TRIGGER ALL;

INSERT INTO public."SyncQueue" (id, "organizationId", "deviceId", "userId", entity, "entityId", operation, payload, "clientVersion", status, attempts, "lastAttemptAt", "syncedAt", "errorMessage", "createdAt", "updatedAt") VALUES ('a2ba2b93-7550-4021-9341-454b063be08e', 'cd2d1e2f-83aa-46e6-982b-2e020d7fe0af', 'tablet-sunflower-01', '74f06c0a-b838-4549-8b86-6a6d386ff69f', 'Observation', 'e3e4f955-dbf3-41cf-8806-b7116b83b3e3', 'UPDATE', '{"note": "Offline edit: Alex completed pouring independently", "timestamp": "2026-09-02T15:18:16.994Z", "masteryLevel": "MASTERED"}', 2, 'CONFLICT', 1, '2026-09-03 15:18:16.994', NULL, 'Server version (3) is newer than client version (2). Manual resolution required.', '2026-09-03 15:18:16.997', '2026-09-03 15:18:16.997');


ALTER TABLE public."SyncQueue" ENABLE TRIGGER ALL;

--
-- Data for Name: Timesheet; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public."Timesheet" DISABLE TRIGGER ALL;



ALTER TABLE public."Timesheet" ENABLE TRIGGER ALL;

--
-- Data for Name: UserRole; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public."UserRole" DISABLE TRIGGER ALL;

INSERT INTO public."UserRole" (id, "userId", "roleId", "createdAt") VALUES ('0db38562-84c2-4f7e-8846-5f223dba3279', '304d564b-7ce6-4ef3-b27c-2b7709881448', '9191cb07-0ff9-4fba-a2e6-a8da780db1f9', '2026-09-03 15:18:14.491');
INSERT INTO public."UserRole" (id, "userId", "roleId", "createdAt") VALUES ('6edfed91-cd2b-4402-a530-b512129d2264', '6d5c28e3-25ea-433d-96f7-fc2a2e5b6b8a', '7fce7d0f-cc4e-460b-8b94-f313416cda8c', '2026-09-03 15:18:14.523');
INSERT INTO public."UserRole" (id, "userId", "roleId", "createdAt") VALUES ('e152c44a-f3d8-40b5-ac31-ac40a8138987', '74f06c0a-b838-4549-8b86-6a6d386ff69f', '62a0f84b-c2f4-492c-8131-69d89b98795b', '2026-09-03 15:18:14.539');
INSERT INTO public."UserRole" (id, "userId", "roleId", "createdAt") VALUES ('afcb5d4d-e080-47d8-a465-91bf84834580', '1b0cb6e1-b800-4e88-aea2-1ef397b652b3', '6d83a4af-2168-4966-81ed-e72840e29600', '2026-09-03 15:18:14.56');
INSERT INTO public."UserRole" (id, "userId", "roleId", "createdAt") VALUES ('8df3e313-57c4-4a69-b195-92e180bf4e3b', '3fcda805-31ba-4596-af43-a3d57babf0d8', 'db6aff62-2bb2-4e37-aecd-12ca106ad26b', '2026-09-03 15:18:14.577');
INSERT INTO public."UserRole" (id, "userId", "roleId", "createdAt") VALUES ('b764b19e-d411-4474-a4b1-2f5f7f2d084b', 'dc3fa849-2543-4d90-991b-fd3acacadde4', 'fed41f57-ec9e-4c2d-9395-1c3f92b00538', '2026-09-03 15:18:14.6');
INSERT INTO public."UserRole" (id, "userId", "roleId", "createdAt") VALUES ('fe4b5d58-ce94-48d8-a57b-d1a3f712d7f8', '83407454-d11d-4026-a86d-064a3e45f933', '12980534-f171-4218-bad6-b9e819b3f7d7', '2026-09-03 15:18:14.619');
INSERT INTO public."UserRole" (id, "userId", "roleId", "createdAt") VALUES ('6dab12be-3306-4402-8d81-422141d83e51', '199eb894-54cd-453f-9418-6cc70d83f1c6', '12980534-f171-4218-bad6-b9e819b3f7d7', '2026-09-03 15:18:14.633');
INSERT INTO public."UserRole" (id, "userId", "roleId", "createdAt") VALUES ('f7d1077a-1b87-4fb1-a0ae-e6169980da7d', 'dc75a027-8b85-46c1-9621-c7d765a819e5', '12980534-f171-4218-bad6-b9e819b3f7d7', '2026-09-03 15:18:14.657');
INSERT INTO public."UserRole" (id, "userId", "roleId", "createdAt") VALUES ('e2edc4e0-75c5-4e3d-9474-da07d6c518ed', '4889a8e9-58de-422e-9cb1-2a9849420e91', '70d3ee81-5d0a-452f-bb0e-96d9d7d0978e', '2026-09-03 15:18:14.672');


ALTER TABLE public."UserRole" ENABLE TRIGGER ALL;

--
-- PostgreSQL database dump complete
--

\unrestrict 0sJz6Q2kPhPASpZIVsJVgWlcT2Ibf7znhCfySWPqOKhqErbk7rNNIBSZPedOl6r

