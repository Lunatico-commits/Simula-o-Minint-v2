import React from 'react';
import { MultiplayerDuel, normalizeRoomCode } from './MultiplayerDuel';
import { createRoom, joinRoom, listenToRoom, submitDuelAnswer, normalizeRoomData } from '../services/duelService';

export { createRoom, joinRoom, listenToRoom, submitDuelAnswer, normalizeRoomData, MultiplayerDuel, normalizeRoomCode };
export const DuelsView = MultiplayerDuel;
export default DuelsView;

