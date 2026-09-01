import React from 'react';
import { MultiplayerDuel, normalizeRoomCode } from './MultiplayerDuel';
import { createRoom, joinRoom, listenToRoom, submitDuelAnswer } from '../services/duelService';

export { createRoom, joinRoom, listenToRoom, submitDuelAnswer, MultiplayerDuel, normalizeRoomCode };
export const DuelsView = MultiplayerDuel;
export default DuelsView;

