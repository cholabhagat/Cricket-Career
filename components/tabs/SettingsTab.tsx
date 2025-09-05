
import React, { useRef } from 'react';
import type { TrashItem } from '../../types';
import { Card } from '../Card';

interface SettingsTabProps {
    trash: TrashItem[];
    onRestore: (item: TrashItem) => void;
    onDeletePermanently: (item: TrashItem) => void;
    onImportData: (data: string) => void;
    onExportData: () => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({ trash, onRestore, onDeletePermanently, onImportData, onExportData }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const toggleDarkMode = () => {
        const html = document.documentElement;
        if (html.classList.contains('dark')) {
            html.classList.remove('dark');
            localStorage.setItem('darkMode', 'disabled');
        } else {
            html.classList.add('dark');
            localStorage.setItem('darkMode', 'enabled');
        }
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                onImportData(e.target?.result as string);
            };
            reader.readAsText(file);
        }
    };

    return (
        <div>
            <Card title="Settings">
                <div className="space-y-8">
                    <div>
                        <h3 className="text-xl font-semibold mb-2">Data Management</h3>
                        <div className="flex space-x-2">
                            <button onClick={onExportData} className="btn btn-warning">Export Data</button>
                            <button onClick={handleImportClick} className="btn btn-warning">Import Data</button>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold mb-2">Appearance</h3>
                        <button onClick={toggleDarkMode} className="btn btn-secondary">Toggle Dark Mode</button>
                    </div>
                </div>
            </Card>

            <Card title="Archive (Trash)">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Items here are permanently deleted from local storage. There is no time-based purge in this version.</p>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-border">
                        <thead className="bg-gray-50 dark:bg-dark-border">
                            <tr>
                                <th className="th-cell text-left">Item</th>
                                <th className="th-cell text-left">Type</th>
                                <th className="th-cell text-left">Deleted On</th>
                                <th className="th-cell text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-dark-card divide-y divide-gray-200 dark:divide-dark-border">
                            {trash.map(item => (
                                <tr key={`${item.type}-${item.data.id}`}>
                                    <td className="td-cell">{ 'name' in item.data ? item.data.name : `Match on ${'date' in item.data ? item.data.date : 'N/A'}`}</td>
                                    <td className="td-cell capitalize">{item.type}</td>
                                    <td className="td-cell">{new Date(item.deletedOn).toLocaleString()}</td>
                                    <td className="td-cell">
                                        <div className="flex justify-end space-x-2">
                                            <button onClick={() => onRestore(item)} className="btn-sm btn-success">Restore</button>
                                            <button onClick={() => window.confirm('This is permanent. Are you sure?') && onDeletePermanently(item)} className="btn-sm btn-danger">Delete Permanently</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};
