export const API_BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:8000';

export async function fetchJobs(shopId: string) {
    const res = await fetch(`${API_BASE_URL}/api/jobs?shopId=${shopId}`);
    if (!res.ok) throw new Error('Failed to fetch jobs');
    return res.json();
}

export async function createJob(data: Record<string, unknown>) {
    const res = await fetch(`${API_BASE_URL}/api/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create job');
    return res.json();
}

export async function updateJob(id: string, data: Record<string, unknown>) {
    const res = await fetch(`${API_BASE_URL}/api/jobs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update job');
    return res.json();
}

export async function deleteJob(id: string) {
    const res = await fetch(`${API_BASE_URL}/api/jobs/${id}`, {
        method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete job');
    return res.json();
}
