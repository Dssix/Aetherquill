import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../stores/useAppStore';
import { type ProjectData } from '../dataModels/userData';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

// A new, simple component for the project creation modal.
const NewProjectModal = ({ onSave, onClose }: { onSave: (name: string) => void, onClose: () => void }) => {
    const [projectName, setProjectName] = useState('');

    const handleSave = () => {
        if (!projectName.trim()) {
            alert('A project must have a name.');
            return;
        }
        onSave(projectName.trim());
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
                <h2 className="text-2xl font-bold text-ink-brown mb-4">Create a New Chronicle</h2>
                <input
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Name of your new world..."
                    className="w-full p-2 mt-1 bg-parchment/70 border-b-2 border-ink-brown/20 focus:outline-none focus:border-gold-leaf"
                    autoFocus
                />
                <div className="flex justify-end gap-4 mt-6">
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSave}>Create</Button>
                </div>
            </Card>
        </div>
    );
};

const RenameProjectModal = ({ currentName, onSave, onClose }: { currentName: string, onSave: (newName: string) => void, onClose: () => void }) => {
    const [newName, setNewName] = useState(currentName);

    const handleSave = () => {
        if (!newName.trim()) {
            alert('A project must have a name.');
            return;
        }
        onSave(newName.trim());
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
                <h2 className="text-2xl font-bold text-ink-brown mb-4">Rename Chronicle</h2>
                <input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full p-2 mt-1 bg-parchment/70 border-b-2 border-ink-brown/20 focus:outline-none focus:border-gold-leaf"
                    autoFocus
                />
                <div className="flex justify-end gap-4 mt-6">
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSave}>Save</Button>
                </div>
            </Card>
        </div>
    );
};


const DashboardPage: React.FC = () => {
    // --- Step 1: Summon the necessary data and actions from our store ---
    const { currentUser, userData, setCurrentProject, addProject, updateProject, deleteProject, saveCurrentUser } = useAppStore();
    const navigate = useNavigate();
// This single state now controls the "Create Project" modal.
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
// This state remains the same for the "Rename Project" modal.
    const [projectToRename, setProjectToRename] = useState<{ id: string, name: string } | null>(null);

    // Convert the projects object into a usable array.
    const projects = userData ? Object.values(userData.projects) : [];

    // --- Step 2: Define the logic for selecting and creating projects ---
    const handleSelectProject = (projectId: string) => {
        setCurrentProject(projectId);
        // For convenience, we can save this as the "last opened" project.
        localStorage.setItem('aetherquill__last_project', projectId);
        navigate('/project'); // Redirect to the main application view.
    };

    const handleCreateProject = (name: string) => {
        if (!currentUser) return;

        const newProject: ProjectData = {
            projectId: `proj_${Date.now()}`,
            name,
            characters: [],
            worlds: [],
            writings: [],
            timeline: [],
        };

        addProject(newProject);
        // Important: After modifying data, we must explicitly save it.
        saveCurrentUser();
    };

    const handleRenameProject = (newName: string) => {
        if (!projectToRename) return;
        updateProject(projectToRename.id, newName);
        saveCurrentUser(); // Persist the change
        setProjectToRename(null); // Close the modal
    };

    const handleDeleteProject = (projectId: string, projectName: string) => {
        if (window.confirm(`Are you sure you wish to consign the chronicle "${projectName}" to the flames? This cannot be undone.`)) {
            deleteProject(projectId);
            saveCurrentUser(); // Persist the change
        }
    };

    return (
        <main className="min-h-screen w-full p-4 sm:p-8 bg-cover bg-center" style={{ backgroundImage: "url('/parchment-bg.png')" }}>
            {/*<Header />*/}
            <div className="flex-grow flex flex-col items-center justify-center p-4 sm:p-8">
                <div className="max-w-4xl mx-auto">
                    <header className="text-center mb-12 animate-fade-in-down">
                        <h1 className="text-5xl font-bold text-ink-brown">Welcome, {currentUser}</h1>
                        <p className="text-lg text-ink-brown/80 italic mt-2">Choose a chronicle to continue thy work.</p>
                    </header>

                    <div className="flex justify-center mb-8">
                        <Button onClick={() => setIsCreateModalOpen(true)}>
                            + New Project
                        </Button>
                    </div>

                    {/* --- Step 3: Render the list of project cards --- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map(project => (
                            <Card key={project.projectId} className="animate-fade-in-up">
                                <div className="flex flex-col justify-between h-full">
                                    <div>
                                        <h3 className="text-2xl font-bold text-ink-brown">{project.name}</h3>
                                        <p className="text-xs text-ink-brown/60 mt-2">
                                            {project.characters.length} Souls, {project.worlds.length} Realms
                                        </p>
                                    </div>
                                    <div className="mt-6 flex justify-between items-center">
                                        <div className="flex gap-2">
                                            <button onClick={() => setProjectToRename({ id: project.projectId, name: project.name })} className="text-xs text-ink-brown/70 hover:text-gold-leaf transition-colors">
                                                Rename
                                            </button>
                                            <button onClick={() => handleDeleteProject(project.projectId, project.name)} className="text-xs text-red-800/80 hover:text-red-700 transition-colors">
                                                Delete
                                            </button>
                                        </div>
                                        <Button variant="secondary" onClick={() => handleSelectProject(project.projectId)}>
                                            Open
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>

                    {projects.length === 0 && (
                        <Card className="text-center animate-fade-in-up">
                            <p className="text-lg text-ink-brown/90 my-6">No chronicles found. Forge thy first to begin.</p>
                        </Card>
                    )}
                </div>
            </div>

            {isCreateModalOpen && (
                <NewProjectModal
                    onClose={() => setIsCreateModalOpen(false)}
                    onSave={handleCreateProject}
                />
            )}
            {projectToRename && (
                <RenameProjectModal
                    currentName={projectToRename.name}
                    onClose={() => setProjectToRename(null)}
                    onSave={handleRenameProject}
                />
            )}
        </main>
    );
};

export default DashboardPage;