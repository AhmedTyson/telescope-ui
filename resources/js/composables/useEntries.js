import { ref, onUnmounted } from 'vue';
import { apiPost, apiGet } from '../api';

export const isPaused = ref(false);

export function useEntries(type) {
    const entries = ref([]);
    const loading = ref(false);
    const loadingMore = ref(false);
    const hasMore = ref(false);
    const nextCursor = ref(null);
    const totalOffset = ref(null);
    const error = ref(null);
    const expandedEntry = ref(null);
    const entryDetail = ref(null);
    const loadingDetail = ref(false);

    const sortBy = ref(null);
    const sortDirection = ref(null);
    
    let pollInterval = null;

    function setSort(column, direction) {
        sortBy.value = column;
        sortDirection.value = direction;
        totalOffset.value = null;
        nextCursor.value = null;
    }

    async function fetchEntries(filters = {}, append = false) {
        if (append) {
            loadingMore.value = true;
        } else {
            if (!entries.value.length) loading.value = true;
        }
        error.value = null;

        const payload = {
            type,
            ...filters,
            before_sequence: append ? nextCursor.value : null,
            offset: append ? totalOffset.value : null,
            sort_by: sortBy.value,
            sort_direction: sortDirection.value,
        };

        try {
            const res = await apiPost('/entries', payload);
            if (append) {
                entries.value = [...entries.value, ...res.entries];
            } else {
                entries.value = res.entries;
            }
            hasMore.value = res.has_more;
            nextCursor.value = res.next_cursor;
            totalOffset.value = res.total_offset;
        } catch (err) {
            error.value = err.message || 'Error loading entries';
        } finally {
            loading.value = false;
            loadingMore.value = false;
        }
    }

    function loadMore(filters = {}) {
        if (!hasMore.value || loadingMore.value) return;
        fetchEntries(filters, true);
    }

    async function toggleDetail(uuid) {
        if (expandedEntry.value === uuid) {
            expandedEntry.value = null;
            entryDetail.value = null;
            return;
        }

        expandedEntry.value = uuid;
        loadingDetail.value = true;
        entryDetail.value = null;

        try {
            const res = await apiGet(`/entries/${uuid}/detail`);
            entryDetail.value = res.entry ?? res;
        } catch (err) {
            // handle
        } finally {
            loadingDetail.value = false;
        }
    }

    function startPolling(filters = {}) {
        stopPolling();
        pollInterval = setInterval(() => {
            if (!isPaused.value && !loadingMore.value && !expandedEntry.value) {
                fetchEntries(filters, false);
            }
        }, 1500); // Fast 1.5s poll
    }

    function stopPolling() {
        if (pollInterval) clearInterval(pollInterval);
    }

    onUnmounted(() => {
        stopPolling();
    });

    return {
        entries,
        loading,
        loadingMore,
        hasMore,
        error,
        expandedEntry,
        entryDetail,
        loadingDetail,
        sortBy,
        sortDirection,
        setSort,
        fetchEntries,
        loadMore,
        toggleDetail,
        startPolling,
        stopPolling
    };
}
