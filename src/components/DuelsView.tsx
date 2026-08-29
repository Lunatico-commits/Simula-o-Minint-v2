import React from 'react';
import { MultiplayerDuel } from './MultiplayerDuel';
import { createRoom } from '../services/duelService';

export { createRoom, MultiplayerDuel };
export const DuelsView = MultiplayerDuel;
export default DuelsView;

