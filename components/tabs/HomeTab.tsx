
import React, { useState, useEffect, useRef } from 'react';
import type { Player, Match } from '../../types';
import { Card } from '../Card';
import { getPlayerStats } from '../../utils/statsCalculator';
import { DEFAULT_AVATAR } from '../../constants';

interface HomeTabProps {
    players: Player[];
    matches: Match[];
    editingPlayer: Player | null;
    onAddPlayer: (player: Omit<Player, 'id' | 'achievements'>) => void;
    onUpdatePlayer: (player: Player) => void;
    onEditPlayer: (player: Player) => void;
    onDeletePlayer: (id: number) => void;
    onViewStats: (id: number) => void;
    onResetEditingPlayer: () => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({ players, matches, editingPlayer, onAddPlayer, onUpdatePlayer, onEditPlayer, onDeletePlayer, onViewStats, onResetEditingPlayer }) => {
    const [formData, setFormData] = useState({ name: '', dob: '', role: '', battingStyle: '', bowlingStyle: '' });
    const [avatarPreview, setAvatarPreview] = useState<string | null>(DEFAULT_AVATAR);
    const [avatarBase64, setAvatarBase64] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (editingPlayer) {
            setFormData({
                name: editingPlayer.name,
                dob: editingPlayer.dob || '',
                role: editingPlayer.role || '',
                battingStyle: editingPlayer.battingStyle || '',
                bowlingStyle: editingPlayer.bowlingStyle || ''
            });
            setAvatarPreview(editingPlayer.avatarUrl || DEFAULT_AVATAR);
            setAvatarBase64(editingPlayer.avatarUrl || null);
        } else {
            resetForm();
        }
    }, [editingPlayer]);

    const resetForm = () => {
        setFormData({ name: '', dob: '', role: '', battingStyle: '', bowlingStyle: '' });
        setAvatarPreview(DEFAULT_AVATAR);
        setAvatarBase64(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        onResetEditingPlayer();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setAvatarPreview(result);
                setAvatarBase64(result);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const playerData = { ...formData, avatarUrl: avatarBase64 };
        if (editingPlayer) {
            onUpdatePlayer({ ...editingPlayer, ...playerData });
        } else {
            onAddPlayer(playerData);
        }
        resetForm();
    };

    return (
        <div>
            <Card title={editingPlayer ? `Editing ${editingPlayer.name}` : 'Add New Player'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Player Name" required className="input-field" />
                        <input type="date" name="dob" value={formData.dob} onChange={handleChange} title="Date of Birth" className="input-field" />
                        <input type="text" name="role" value={formData.role} onChange={handleChange} placeholder="Playing Role" className="input-field" />
                        <input type="text" name="battingStyle" value={formData.battingStyle} onChange={handleChange} placeholder="Batting Style" className="input-field" />
                        <input type="text" name="bowlingStyle" value={formData.bowlingStyle} onChange={handleChange} placeholder="Bowling Style" className="input-field" />
                        <div className="flex items-center gap-4">
                            <img src={avatarPreview || DEFAULT_AVATAR} alt="Avatar" className="w-20 h-20 rounded-full object-cover bg-gray-200" />
                            <input type="file" accept="image/*" onChange={handleAvatarUpload} ref={fileInputRef} className="hidden" />
                            <button type="button" onClick={() => fileInputRef.current?.click()} className="btn btn-secondary">Upload Avatar</button>
                        </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                        {editingPlayer && <button type="button" onClick={resetForm} className="btn btn-secondary">Cancel</button>}
                        <button type="submit" className="btn btn-success">{editingPlayer ? 'Update Player' : 'Add Player'}</button>
                    </div>
                </form>
            </Card>

            <Card title="Player Roster">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-border">
                        <thead className="bg-gray-50 dark:bg-dark-border">
                            <tr>
                                <th className="th-cell text-left">Avatar</th>
                                <th className="th-cell text-left">Name</th>
                                <th className="th-cell text-left">Recent Form</th>
                                <th className="th-cell text-left">Role</th>
                                <th className="th-cell text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-dark-card divide-y divide-gray-200 dark:divide-dark-border">
                            {players.map(player => {
                                const stats = getPlayerStats(player.id, matches, [], {});
                                return (
                                    <tr key={player.id}>
                                        <td className="td-cell"><img src={player.avatarUrl || DEFAULT_AVATAR} alt={player.name} className="w-12 h-12 rounded-full object-cover" /></td>
                                        <td className="td-cell font-medium">{player.name}</td>
                                        <td className="td-cell text-sm">
                                            <div><strong>Bat:</strong> {stats.last5BattingScores.map(s => s === null ? 'DNB' : s).join(', ')}</div>
                                            <div><strong>Bowl:</strong> {stats.last5BowlingFigures.map(f => f === null ? 'DNB' : f).join(', ')}</div>
                                        </td>
                                        <td className="td-cell">{player.role || '-'}</td>
                                        <td className="td-cell">
                                            <div className="flex justify-end space-x-2">
                                                <button onClick={() => onViewStats(player.id)} className="btn-sm btn-secondary">Stats</button>
                                                <button onClick={() => onEditPlayer(player)} className="btn-sm btn-secondary">Edit</button>
                                                <button onClick={() => window.confirm('Are you sure you want to delete this player?') && onDeletePlayer(player.id)} className="btn-sm btn-danger">Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

// Add some base styles to index.html's tailwind config or a global css file if you had one
// For now, let's define them as constants here for clarity, though this is not standard practice.
const globalStyles = `
    .input-field { @apply w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-dark-border dark:border-gray-600 dark:text-dark-text; }
    .btn { @apply px-4 py-2 rounded-md font-semibold text-white transition-colors duration-200; }
    .btn-sm { @apply px-2 py-1 rounded-md font-semibold text-white transition-colors duration-200 text-sm; }
    .btn-primary { @apply bg-primary hover:bg-blue-700; }
    .btn-success { @apply bg-success hover:bg-green-700; }
    .btn-danger { @apply bg-danger hover:bg-red-700; }
    .btn-warning { @apply bg-warning hover:bg-yellow-600; }
    .btn-secondary { @apply bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700; }
    .th-cell { @apply px-6 py-3 text-xs font-medium text-gray-500 dark:text-dark-secondary-text uppercase tracking-wider; }
    .td-cell { @apply px-6 py-4 whitespace-nowrap; }
`;

// A simple trick to inject styles - in a real app use a global CSS file.
const styleSheet = document.createElement("style");
styleSheet.innerText = globalStyles.replace(/@apply /g, '');
document.head.appendChild(styleSheet);
