<template>
    <div class="bg-transparent p-4">
        <!-- Loading -->
        <div v-if="loading" class="flex items-center justify-center py-8">
            <div class="flex items-center gap-2 text-[#a1a1aa]">
                <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span class="text-sm">Loading detail...</span>
            </div>
        </div>

        <template v-else-if="detail">
            <!-- Tabs -->
            <div class="flex border-b border-telescope-border mb-4 gap-1">
                <button
                    v-for="tab in availableTabs"
                    :key="tab.key"
                    class="px-3 py-2 text-sm rounded-t-md transition-colors font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-telescope-accent"
                    :class="activeTab === tab.key
                        ? 'text-[#f4f4f5] bg-[#0a0a0a] border border-telescope-border border-b-[#0a0a0a] -mb-px'
                        : 'text-[#a1a1aa] hover:text-white hover:bg-[rgba(255,255,255,0.03)]'"
                    @click="activeTab = tab.key"
                >
                    {{ tab.label }}
                </button>
            </div>

            <!-- Content Container -->
            <div class="card p-4 overflow-x-auto text-sm">
                <!-- Rich Mail Renderer -->
                <div v-if="activeTab === 'mail_preview' && isMail">
                    <!-- Wrapper gives it a paper-like feel so dark mode users aren't blinded by edge-to-edge white -->
                    <div class="p-4 bg-[#e4e4e7] rounded-xl shadow-inner">
                        <iframe :srcdoc="detail.content.html" class="w-full h-[600px] border-0 bg-white rounded shadow-sm" sandbox="allow-same-origin"></iframe>
                    </div>
                </div>
                
                <!-- Rich Query Renderer -->
                <div v-else-if="activeTab === 'content' && detail.type === 'query'" class="font-mono text-[13px] leading-relaxed whitespace-pre-wrap text-[#f4f4f5]" v-html="highlightSQL(detail.content.sql)">
                </div>

                <!-- Query Bindings Renderer -->
                <div v-else-if="activeTab === 'bindings' && detail.type === 'query'">
                    <div v-if="!detail.content.bindings || detail.content.bindings.length === 0"
                         class="text-[#71717a] text-sm font-mono italic">
                        No bindings — query uses no parameters.
                    </div>
                    <div v-else class="space-y-1">
                        <div v-for="(val, idx) in detail.content.bindings" :key="idx"
                             class="flex items-baseline gap-3 font-mono text-sm">
                            <span class="text-[#a855f7] w-6 text-right flex-shrink-0">{{ idx + 1 }}</span>
                            <span class="text-[#f4f4f5]">{{ val }}</span>
                        </div>
                    </div>
                </div>

                <!-- Exception Trace Renderer -->
                <div v-else-if="activeTab === 'trace' && detail.type === 'exception'" class="space-y-1">
                    <div v-for="(frame, i) in detail.content.trace" :key="i" class="p-2 rounded font-mono text-[12px] break-all" :class="frame.file && frame.file.includes('/vendor/') ? 'text-[#71717a] bg-transparent' : 'text-[#f4f4f5] bg-[rgba(255,255,255,0.03)] border border-telescope-border/50'">
                        <span class="text-[#a855f7]">{{ frame.class || frame.file }}</span><span class="text-[#a1a1aa]">{{ frame.type || '::' }}</span><span class="text-[#38bdf8]">{{ frame.function }}</span><span v-if="frame.line" class="text-[#10b981]"> :{{ frame.line }}</span>
                    </div>
                </div>

                <!-- Default JSON Viewers -->
                <JsonViewer v-else-if="activeTab === 'content'" :data="detail.content" />
                <JsonViewer v-else-if="activeTab === 'headers'" :data="detail.content.headers" />
                <JsonViewer v-else-if="activeTab === 'payload'" :data="detail.content.payload" />
                <JsonViewer v-else-if="activeTab === 'response'" :data="detail.content.response" />
                <JsonViewer v-else-if="activeTab === 'session'" :data="detail.content.session" />
            </div>

            <!-- Tags -->
            <div v-if="detail.tags && detail.tags.length" class="mt-4">
                <h4 class="text-sm font-semibold text-[#f4f4f5] mb-2">Tags</h4>
                <div class="flex flex-wrap gap-2">
                    <span v-for="tag in detail.tags" :key="tag" class="px-2 py-1 bg-[rgba(255,255,255,0.04)] text-[#a1a1aa] rounded text-xs font-mono border border-telescope-border">
                        {{ tag }}
                    </span>
                </div>
            </div>
            
            <!-- Related Entries -->
            <div v-if="activeTab === 'content' && detail.batch_id" class="mt-8 pt-4 border-t border-telescope-border">
                <h4 class="text-sm font-semibold text-[#f4f4f5] mb-4">Related Entries in Batch</h4>
                <RelatedEntries :batch-id="detail.batch_id" :current-id="detail.uuid" />
            </div>
        </template>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import JsonViewer from './JsonViewer.vue';
import RelatedEntries from './RelatedEntries.vue';
import Prism from 'prismjs';
import 'prismjs/components/prism-sql';

const props = defineProps({
    detail: { type: Object, default: null },
    loading: { type: Boolean, default: false },
    tabs: { type: Array, default: () => [] }
});

const activeTab = ref(props.tabs.length ? props.tabs[0].key : 'content');

const isMail = computed(() => props.detail?.type === 'mail');

const availableTabs = computed(() => {
    let t = [...props.tabs];
    if (isMail.value && props.detail?.content?.html) {
        t.unshift({ key: 'mail_preview', label: 'HTML Preview' });
        if (activeTab.value === 'content') activeTab.value = 'mail_preview';
    }
    return t;
});

function highlightSQL(sql) {
    if (!sql) return '';
    return Prism.highlight(sql, Prism.languages.sql, 'sql');
}
</script>

<style>
/* Custom tweaks for Prism dark mode to match TeamsLeech */
code[class*="language-"], pre[class*="language-"] { text-shadow: none; font-family: var(--font-mono); }
.token.keyword { color: #a855f7; font-weight: bold; }
.token.string { color: #10b981; }
.token.function { color: #38bdf8; }
.token.number { color: #f59e0b; }
</style>
