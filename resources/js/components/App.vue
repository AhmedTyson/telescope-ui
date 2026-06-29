<template>
    <div class="flex h-screen overflow-hidden bg-telescope-darker">
        <Sidebar :collapsed="sidebarCollapsed" @toggle="sidebarCollapsed = !sidebarCollapsed" />

        <div class="flex-1 flex flex-col overflow-hidden" :class="sidebarCollapsed ? 'ml-14' : 'ml-56'">
            <!-- Top bar -->
            <header class="flex items-center justify-between px-6 py-3 border-b border-telescope-border bg-telescope-sidebar flex-shrink-0">
                <div class="flex items-center gap-2">
                    <span class="text-xs text-telescope-muted">Environment</span>
                    <span class="badge badge-green">local</span>
                </div>
                <div class="flex items-center gap-4">
                    <span class="text-xs text-telescope-muted font-mono">{{ currentTime }}</span>
                    <a
                        href="/telescope"
                        target="_blank"
                        class="text-xs text-telescope-muted hover:text-telescope-accent transition-colors"
                    >
                        Default UI →
                    </a>
                </div>
            </header>

            <!-- Main content -->
            <main class="flex-1 overflow-y-auto">
                <div class="p-6">
                    <router-view />
                </div>
            </main>
        </div>

        <!-- Mobile overlay -->
        <div
            v-if="!sidebarCollapsed"
            class="fixed inset-0 bg-black/60 z-20 lg:hidden"
            @click="sidebarCollapsed = true"
        />
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import Sidebar from './Sidebar.vue';

const sidebarCollapsed = ref(window.innerWidth < 1024);
const currentTime = ref('');

function updateTime() {
    currentTime.value = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

let timer;
onMounted(() => {
    updateTime();
    timer = setInterval(updateTime, 1000);
});
onUnmounted(() => clearInterval(timer));
</script>
