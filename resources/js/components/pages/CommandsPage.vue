<template>
    <div>
        <h1 class="text-2xl font-bold text-[#f4f4f5] dark:text-white mb-6">Commands</h1>
        <FilterPanel :active-count="Object.keys(getActiveFilters()).length" @search="search" @reset="reset">
            <div>
                <label class="block text-xs font-medium text-[#a1a1aa] dark:text-[#71717a] mb-1">Command Name</label>
                <input v-model="filters.command_name" type="text" placeholder="Search by command name..." class="input-field text-xs">
            </div>
            <div>
                <label class="block text-xs font-medium text-[#a1a1aa] dark:text-[#71717a] mb-1">Exit Code</label>
                <input v-model="filters.exit_code" type="number" placeholder="Filter by exit code..." class="input-field text-xs">
            </div>
            <div>
                <label class="block text-xs font-medium text-[#a1a1aa] dark:text-[#71717a] mb-1">Content Search</label>
                <input v-model="filters.content" type="text" placeholder="Search content..." class="input-field text-xs">
            </div>
            <DateRangeFilter v-model:from="filters.date_from" v-model:to="filters.date_to" />
        </FilterPanel>
        <DataTable :columns="columns" :entries="entries" :loading="loading" :error="error" :expanded-entry="expandedEntry" :entry-detail="entryDetail" :loading-detail="loadingDetail" entry-type="command" :sort-by="sortBy" :sort-direction="sortDirection" @toggle-detail="toggleDetail" @retry="search" @sort="handleSort">
            <template #cell-content.exit_code="{ value }">
                <span :class="value === 0 ? 'text-green-400' : 'text-red-400'" class="font-semibold">
                    {{ value }}
                </span>
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
    toggleDetail,
    sortBy,
    sortDirection,
    setSort, startPolling, stopPolling 
} = useEntries('command');

const { filters, getActiveFilters, resetFilters } = useFilters({
    command_name: '',
    exit_code: '',
    content: '',
    date_from: '',
    date_to: ''
});

const { restoreFromUrl, syncToUrl } = useUrlSync(filters, sortBy, sortDirection);

const columns = [
    { key: 'content.command', label: 'Command' },
    { key: 'content.arguments', label: 'Arguments' },
    { key: 'content.exit_code', label: 'Exit Code', width: '100px' },
    { key: 'content.duration', label: 'Duration', width: '120px', format: 'duration', sortable: true, sortKey: 'content.duration' },
    { key: 'created_at', label: 'Time', format: 'datetime', width: '180px', sortable: true, sortKey: 'created_at' }
];

const tabs = [
    { key: 'content', label: 'Overview' }
];

const handleSort = (column) => {
    if (sortBy.value === column) {
        if (sortDirection.value === 'desc') {
            setSort(column, 'asc');
        } else {
            setSort(null, null);
        }
    } else {
        setSort(column, 'desc');
    }
    fetchEntries(getActiveFilters());
    syncToUrl();
};

const search = () => {
    fetchEntries(getActiveFilters());
    syncToUrl();
};

const reset = () => {
    resetFilters();
    setSort(null, null);
    fetchEntries({});
    syncToUrl();
};

onMounted(() => {
    restoreFromUrl();
    search();
});
</script>

