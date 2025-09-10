export const dynamic = 'force-dynamic';

import { getProjectsWithStats } from '@/app/lib/services/projectManagerServices/getProjects';
import { getTasksWithDetails } from '@/app/lib/services/projectManagerServices/getTasks';
import { getTimeEntries } from '@/app/lib/services/projectManagerServices/timeEntryServices';
import ProjectManagerPageContent from '@/components/projectManagerComponents/ProjectManagerPageContent';

export default async function ProjectManagerPage() {
    try {
        const [projects, tasks, timeEntries] = await Promise.all([
            getProjectsWithStats(),
            getTasksWithDetails(),
            getTimeEntries()
        ]);

        return (
            <ProjectManagerPageContent 
                projects={projects} 
                tasks={tasks}
                timeEntries={timeEntries}
            />
        );
    } catch (error) {
        console.error('Error loading project manager data:', error);
        
        // Return with empty data on error
        return (
            <ProjectManagerPageContent 
                projects={[]} 
                tasks={[]}
                timeEntries={[]}
            />
        );
    }
}