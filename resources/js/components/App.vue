<template>
    <div class="flex h-screen overflow-hidden">
        <Sidebar :collapsed="sidebarCollapsed" @toggle="sidebarCollapsed = !sidebarCollapsed" />

        <main class="flex-1 flex flex-col h-screen overflow-hidden transition-[margin] duration-300 ease-in-out" :class="sidebarCollapsed ? 'ml-0 lg:ml-16' : 'ml-0 lg:ml-64'">
            <!-- Mobile Header -->
            <header class="lg:hidden flex items-center justify-between p-4 border-b border-gray-200 dark:border-telescope-border bg-white dark:bg-[#0a0a0a] z-10 flex-shrink-0">
                <span class="text-lg font-semibold text-gray-900 dark:text-white">Telescope</span>
                <button
                    class="p-1 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded transition-colors"
                    @click="sidebarCollapsed = false"
                >
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
            </header>

            <div class="flex-1 overflow-y-auto p-6">
                <router-view />
            </div>
        </main>

        <!-- Mobile overlay -->
        <transition
            enter-active-class="transition-opacity duration-300 ease-in-out"
            enter-from-class="opacity-0"
            enter-to-class="opacity-100"
            leave-active-class="transition-opacity duration-300 ease-in-out"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
        >
            <div
                v-if="!sidebarCollapsed"
                class="fixed inset-0 bg-black/50 z-20 lg:hidden backdrop-blur-sm"
                @click="sidebarCollapsed = true"
            />
        </transition>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import Sidebar from './Sidebar.vue';

const sidebarCollapsed = ref(window.innerWidth < 1024);
</script>
