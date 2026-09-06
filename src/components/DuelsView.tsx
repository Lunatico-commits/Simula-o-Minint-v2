import React from 'react';
import { MultiplayerDuel, normalizeRoomCode } from './MultiplayerDuel';
import { WaitingRoomModal } from './WaitingRoomModal';
import { createRoom, joinRoom, listenToRoom, submitDuelAnswer, normalizeRoomData, cleanRoomCode } from '../services/duelService';

export { 
  createRoom, 
  joinRoom, 
  listenToRoom, 
  submitDuelAnswer, 
  normalizeRoomData, 
  cleanRoomCode,
  MultiplayerDuel, 
  WaitingRoomModal,
  normalizeRoomCode 
};
export const DuelsView = MultiplayerDuel;
export default DuelsView;

