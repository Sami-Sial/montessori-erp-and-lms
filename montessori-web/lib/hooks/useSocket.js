'use client';
import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';
import { selectAccessToken } from '../../store/authSlice';

const SOCKET_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1')
  .replace('/api/v1', '');

/**
 * Returns a stable Socket.IO socket connected to the given room.
 * Handles connect/disconnect lifecycle automatically.
 *
 * Usage:
 *   const socket = useSocket(`classroom:${classroomId}`);
 *   useEffect(() => {
 *     socket.on('attendance:update', handler);
 *     return () => socket.off('attendance:update', handler);
 *   }, [socket]);
 */
export function useSocket(room) {
  const token = useSelector(selectAccessToken);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!room || !token) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      query: { room },
      transports: ['websocket'],
      autoConnect: true,
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [room, token]);

  return socketRef.current;
}
