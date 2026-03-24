const axios = require('axios');
const monitor = require('./monitor.cjs');
const path = require('path');

const CLOUD_API = 'https://baixabaixa.onrender.com/api';
const API_KEY = 'baixabaixa-secret-2026';

const api = axios.create({
    baseURL: CLOUD_API,
    headers: { 'x-api-key': API_KEY }
});

async function pollForWork() {
    try {
        console.log('[Agent] Polling for work...');
        const res = await api.get('/agent/work');
        
        if (res.data && res.data._id) {
            const work = res.data;
            console.log(`[Agent] New work found: ${work.url}`);
            
            // Phase 1: Probe the URL
            const probe = await monitor.probeUrl(work.url);
            
            if (!probe.success) {
                console.error(`[Agent] Probe failed: ${probe.error}`);
                await api.post(`/agent/${work._id}/status`, { status: 'error', message: probe.error });
                return;
            }

            // Phase 2: Perform download
            try {
                console.log(`[Agent] Starting download for: ${probe.title}`);
                await monitor.startMonitoring(work._id, work.url, work.type, work.save_path);
            } catch (err) {
                console.error(`[Agent] Download start failed:`, err.message);
                await api.post(`/agent/${work._id}/status`, { status: 'error' });
            }
        }
    } catch (err) {
        console.error('[Agent] Polling failed:', err.message);
    }
}

// Start polling loop
setInterval(pollForWork, 30000); // 30 seconds
pollForWork();

console.log('[Agent] Local Worker Started.');
