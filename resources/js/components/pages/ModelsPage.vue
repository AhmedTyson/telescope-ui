<template>
    <div>
        <h1 class="text-2xl font-bold text-[#f4f4f5] dark:text-white mb-6">Models</h1>
        <FilterPanel :active-count="Object.keys(getActiveFilters()).length" @search="search" @reset="reset">
            <div>
                <label class="block text-xs font-medium text-[#a1a1aa] dark:text-[#71717a] mb-1">Action</label>
                <select v-model="filters.model_action" class="select-field text-xs">
                    <option value="">All</option>
                    <option value="created">Created</option>
                    <option value="updated">Updated</option>
                    <option value="deleted">Deleted</option>
                </select>
            </div>
            <div>
                <label class="block text-xs font-medium text-[#a1a1aa] dark:text-[#71717a] mb-1">Model Type</label>
                <input v-model="filters.model_type" type="text" placeholder="e.g., App\Models\User" class="input-field text-xs">
            </div>
            <div>
                <label class="block text-xs font-medium text-[#a1a1aa] dark:text-[#71717a] mb-1">Search Content</label>
                <input v-model="filters.content" type="text" placeholder="Search..." class="input-field text-xs">
            </div>
            <DateRangeFilter v-model:from="filters.date_from" v-model:to="filters.date_to" />
        </FilterPanel>
        <DataTable :columns="columns" :entries="entries" :loading="loading" :error="error" :expanded-entry="expandedEntry" :entry-detail="entryDetail" :loading-detail="loadingDetail" entry-type="model" @toggle-detail="toggleDetail" @retry="search">
            <template #cell-content.action="{ value }">
                <Badge :type="'model-action'" :value="value" />
            </template>
            <template #detail="{ detail, loading: dl }">
                <EntryDetail :detail="detail" :loading="dl" :tabs="tabs" />
            </template>
        </DataTable>
        <LoadMore :has-more="hasMore" :loading="loadingMore" @load-more="loadMore(getActiveFilters())" />
    </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useEntries } from '../../composables/useEntries';
import { useFilters } from '../../composables/useFilters';
import { useUrlSync } from '../../composables/useUrlSync';
import FilterPanel from '../shared/FilterPanel.vue';
import DataTable from '../shared/DataTable.vue';
import EntryDetail from '../shared/EntryDetail.vue';
import LoadMore from '../shared/LoadMore.vue';
import DateRangeFilter from '../shared/DateRangeFilter.vue';
import Badge from '../shared/Badge.vue';

const {
    entries,
    loading,
    error,
    hasMore,
    loadingMore,
    expandedEntry,
    entryDetail,
    loadingDetail,
    fetchEntries,
    loadMore,
    toggleDetail, startPolling, stopPolling 
} = useEntries('model');

const {
    filters,
    getActiveFilters,
    resetFilters
} = useFilters({
    model_action: '',
    model_type: '',
    content: '',
    date_from: '',
    date_to: ''
});

const { restoreFromUrl, syncToUrl } = useUrlSync(filters, null, null);

const columns = [
    { key: 'content.action', label: 'Action', width: '100px' },
    { key: 'content.model', label: 'Model' },
    { key: 'created_at', label: 'Time', format: 'datetime', width: '180px' }
];

const tabs = [
    { key: 'content', label: 'Content' }
];

const search = () => {
    fetchEntries(getActiveFilters());
    syncToUrl();
};

const reset = () => {
    resetFilters();
    fetchEntries({});
    syncToUrl();
};

onMounted(() => {
    restoreFromUrl();
    search();
});
</script>

