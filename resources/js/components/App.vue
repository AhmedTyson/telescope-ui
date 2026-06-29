<template>
    <div class="flex h-screen overflow-hidden bg-telescope-darker transition-colors duration-200" @keydown.window="handleHotkey">
        <Sidebar :collapsed="sidebarCollapsed" @toggle="sidebarCollapsed = !sidebarCollapsed" />

        <div class="flex-1 flex flex-col min-w-0 transition-all duration-300" :class="sidebarCollapsed ? 'ml-16' : 'ml-64'">
            <!-- Top Header -->
            <header class="h-14 flex items-center justify-between px-6 border-b border-telescope-border/50 bg-telescope-sidebar/50 backdrop-blur shrink-0">
                <div class="flex items-center gap-3">
                    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Local</span>
                    <span class="text-sm font-medium text-gray-400">Monitoring Dashboard</span>
                </div>
                <div class="flex items-center gap-3">
                    <!-- Action Buttons -->
                    <div class="flex items-center gap-1.5 mr-4 border-r border-telescope-border/50 pr-4">
                        <button class="action-btn" :class="{ 'text-telescope-accent bg-telescope-accent/10 border-telescope-accent/30': isPaused }" @click="togglePause" title="Pause Polling (Space)">
                            <svg v-if="!isPaused" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <svg v-else class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm14.024-.983a1.125 1.125 0 010 1.966l-5.603 3.113A1.125 1.125 0 019 15.113V8.887c0-.857.921-1.4 1.671-.983l5.603 3.113z" clip-rule="evenodd" /></svg>
                        </button>
                        <button class="action-btn hover:text-red-400 hover:bg-red-400/10 hover:border-red-400/30" @click="clearEntries" title="Clear Entries (C)">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                        <button class="action-btn" @click="refreshNow" title="Refresh (R)">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        </button>
                        <button class="action-btn" :class="{ 'text-telescope-accent bg-telescope-accent/10 border-telescope-accent/30': isRecording }" @click="toggleRecording" title="Toggle Recording">
                            <svg v-if="isRecording" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                        </button>
                    </div>

                    <a href="/telescope" target="_blank" class="text-xs font-medium text-gray-500 hover:text-telescope-accent transition-colors flex items-center gap-1">
                        Classic UI
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    </a>
                </div>
            </header>

            <main class="flex-1 overflow-y-auto">
                <div class="p-4 sm:p-6 max-w-7xl mx-auto">
                    <router-view v-slot="{ Component }"><transition name="page-fade" ><component :is="Component" :key="refreshKey" /></transition></router-view>
                </div>
            </main>
        </div>

        <div v-if="!sidebarCollapsed" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 lg:hidden transition-opacity" @click="sidebarCollapsed = true" />
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Sidebar from './Sidebar.vue';
import { isPaused } from '../composables/useEntries';

const sidebarCollapsed = ref(window.innerWidth < 1024);
const isRecording = ref(true);
const refreshKey = ref(0);

const telescopeApiBase = '/telescope/telescope-api';

function togglePause() {
    isPaused.value = !isPaused.value;
}

async function clearEntries() {
    if (!confirm('Are you sure you want to delete all Telescope entries?')) return;
    try {
        await fetch(`${telescopeApiBase}/entries`, {
            method: 'DELETE',
            headers: { 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content') }
        });
        refreshNow();
    } catch (e) {
        alert('Failed to clear entries.');
    }
}

async function toggleRecording() {
    try {
        await fetch(`${telescopeApiBase}/toggle-recording`, {
            method: 'POST',
            headers: { 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content') }
        });
        isRecording.value = !isRecording.value;
    } catch (e) {
        alert('Failed to toggle recording.');
    }
}

function refreshNow() {
    // Incrementing key forces router-view to remount, fetching fresh entries instantly.
    refreshKey.value++;
}

function handleHotkey(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
    if (e.code === 'Space') {
        e.preventDefault();
        togglePause();
    } else if (e.code === 'KeyC') {
        e.preventDefault();
        clearEntries();
    } else if (e.code === 'KeyR') {
        e.preventDefault();
        refreshNow();
    }
}

onMounted(async () => {
    // Check initial recording state if possible, though official UI assumes true unless queried.
});
</script>

<style>
.action-btn {
    @apply flex items-center justify-center w-8 h-8 rounded-lg bg-[rgba(255,255,255,0.03)] border border-telescope-border text-gray-400 hover:text-gray-100 hover:bg-[rgba(255,255,255,0.06)] hover:border-[#333333] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-telescope-accent focus:ring-offset-2 focus:ring-offset-black active:scale-[0.96];
}
</style>




