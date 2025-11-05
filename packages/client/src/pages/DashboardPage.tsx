import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../stores/useAppStore.ts';
import Card from '../components/ui/Card.tsx';
import Button from '../components/ui/Button.tsx';

// A new, simple component for the project creation modal.
const NewProjectModal = ({ onSave, onClose, isLoading }: { onSave: (name: string) => void, onClose: () => void, isLoading: boolean }) => {
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
                <h2 className="text-2xl font-bold text-foreground mb-4">Create a New Chronicle</h2>
                <input
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Name of your new world..."
                    className="w-full p-2 mt-1 bg-input/50 border-b-2 border-border focus:outline-none focus:border-primary"
                    autoFocus
                />
                <div className="flex justify-end gap-4 mt-6">
                    <Button variant="secondary" onClick={onClose} disabled={isLoading}>Cancel</Button>
                    <Button onClick={handleSave} isLoading={isLoading}>
                        {isLoading ? 'Creating...' : 'Create'}
                    </Button>
                </div>
            </Card>
        </div>
    );
};

const RenameProjectModal = ({ currentName, onSave, onClose, isLoading }: { currentName: string, onSave: (newName: string) => void, onClose: () => void, isLoading: boolean }) => {
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
                <h2 className="text-2xl font-bold text-foreground mb-4">Rename Chronicle</h2>
                <input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full p-2 mt-1 bg-input/50 border-b-2 border-border focus:outline-none focus:border-primary"
                    autoFocus
                />
                <div className="flex justify-end gap-4 mt-6">
                    <Button variant="secondary" onClick={onClose} disabled={isLoading}>Cancel</Button>
                    <Button onClick={handleSave} isLoading={isLoading}>
                        {isLoading ? 'Saving...' : 'Save'}
                    </Button>
                </div>
            </Card>
        </div>
    );
};


const DashboardPage: React.FC = () => {
    // --- Step 1: Summon the necessary data and actions from our store ---
    const { currentUser, userData, setCurrentProject, addProject, updateProject, deleteProject, isLoading } = useAppStore();
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

    const handleCreateProject = async (name: string) => {
        try {
            // Call the new async store action, passing only the required data.
            await addProject({ name });
            // Close the modal on success.
            setIsCreateModalOpen(false);
        } catch (error) {
            // The store already shows an error toast, so we just log it for debugging.
            console.error("Failed to create project:", error);
        }
    };

    const handleRenameProject = async (newName: string) => {
        if (!projectToRename) return;
        try {
            // Call the new async store action.
            await updateProject(projectToRename.id, newName);
            // Close the modal only on success.
            setProjectToRename(null);
        } catch (error) {
            console.error("Failed to rename project:", error);
        }
    };

    const handleDeleteProject = async (projectId: string, projectName: string) => {
        if (window.confirm(`Are you sure you wish to consign the chronicle "${projectName}" to the flames? This cannot be undone.`)) {
            try {
                // Call the new async store action.
                await deleteProject(projectId);
            } catch (error) {
                console.error("Failed to delete project:", error);
            }
        }
    };

    return (
        <main className="min-h-screen w-full p-4 sm:p-8 bg-cover bg-center ">
            {/*<Header />*/}
            <div className="flex-grow flex flex-col items-center justify-center p-4 sm:p-8">
                <div className="max-w-4xl mx-auto">
                    <header className="text-center mb-12 animate-fade-in-down">
                        <h1 className="text-5xl font-bold text-foreground">Welcome, {currentUser}</h1>
                        <p className="text-lg text-muted-foreground italic mt-2">Choose a chronicle to continue thy work.</p>
                    </header>

                    <div className="flex justify-center opacity-0 animate-fade-in-down mb-8">
                        <Button onClick={() => setIsCreateModalOpen(true)}>
                            + New Project
                        </Button>
                    </div>

                    {/* --- Step 3: Render the list of project cards --- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map(project => (
                            <Card key={project.projectId} className="opacity-0 animate-fade-in-up">
                                <div className="flex flex-col justify-between h-full">
                                    <div>
                                        <h3 className="text-2xl font-bold text-foreground">{project.name}</h3>
                                        <p className="text-xs text-foreground/60 mt-2">
                                            {project.characters.length} Souls, {project.worlds.length} Realms
                                        </p>
                                    </div>
                                    <div className="mt-6 flex justify-between items-center">
                                        <div className="flex gap-2">
                                            <button onClick={() => setProjectToRename({ id: project.projectId, name: project.name })} className="text-xs text-foreground/70 hover:text-accent transition-colors">
                                                Rename
                                            </button>
                                            <button onClick={() => handleDeleteProject(project.projectId, project.name)} className="text-xs text-destructive hover:text-red-700 transition-colors">
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
                            <p className="text-lg text-foreground/90 my-6">No chronicles found. Forge thy first to begin.</p>
                        </Card>
                    )}
                </div>
            </div>

            {isCreateModalOpen && (
                <NewProjectModal
                    onClose={() => setIsCreateModalOpen(false)}
                    onSave={handleCreateProject}
                    isLoading={isLoading}
                />
            )}
            {projectToRename && (
                <RenameProjectModal
                    currentName={projectToRename.name}
                    onClose={() => setProjectToRename(null)}
                    onSave={handleRenameProject}
                    isLoading={isLoading}
                />
            )}
        </main>
    );
};

export default DashboardPage;