'use client';

import React, { Suspense, useState, useMemo } from 'react';
import { useUrlState } from '@/hooks/useUrlState';
import { useOrdersQuery } from '@/hooks/useOrdersQuery';
import { Header } from '@/components/Header';
import { SearchBar } from '@/components/SearchBar';
import { FilterBar } from '@/components/FilterBar';
import { ChaosSimulator } from '@/components/ChaosSimulator';
import { VirtualizedTable } from '@/components/VirtualizedTable';
import { Pagination } from '@/components/Pagination';
import { DetailDrawer } from '@/components/DetailDrawer';
import { ErrorState, EmptyState, TableSkeletonRows } from '@/components/States';
import { A11yLiveAnnouncer } from '@/components/A11yLiveAnnouncer';

function ExplorerApp() {
  const {
    params,
    setSearch,
    toggleStatus,
    togglePriority,
    toggleRegion,
    toggleCategory,
    setSorting,
    setPage,
    setPageSize,
    setSelectedId,
    resetFilters,
    getShareableUrl,
  } = useUrlState();

  const [chaosOpen, setChaosOpen] = useState(false);
  const [customLatency, setCustomLatency] = useState<number | undefined>(undefined);
  const [failRate, setFailRate] = useState<number>(0.1);
  const [forceFailActive, setForceFailActive] = useState(false);

  const {
    data,
    isLoading,
    isFetching,
    error,
    requestLogs,
    retry,
    triggerRaceDemo,
    raceDemoMessage,
    clearLogs,
  } = useOrdersQuery(params, {
    simulatedLatency: customLatency,
    failRate,
    forceFail: forceFailActive,
  });

  const selectedOrder = useMemo(() => {
    if (!params.selectedId || !data) return null;
    return (
      data.data.find(
        (o) => o.id === params.selectedId || o.orderNumber === params.selectedId
      ) || null
    );
  }, [params.selectedId, data]);

  const handleForceFailNext = () => {
    setForceFailActive(true);
    setTimeout(() => {
      setForceFailActive(false);
    }, 4000);
  };

  const a11yMessage = useMemo(() => {
    if (error) return `Error: ${error.error}. Please retry.`;
    if (isLoading) return 'Loading order data...';
    if (!data) return '';
    return `Showing ${data.data.length} of ${data.pagination.filteredCount} orders matching filters. Page ${data.pagination.page} of ${data.pagination.totalPages}.`;
  }, [data, isLoading, error]);

  return (
    <div className="min-h-screen bg-[#f5f4f0] text-stone-900 flex flex-col">
      <A11yLiveAnnouncer message={a11yMessage} assertive={!!error} />

      <Header
        totalRecords={data?.pagination.totalCount || 12000}
        filteredRecords={data?.pagination.filteredCount}
        isFetching={isFetching}
        chaosOpen={chaosOpen}
        onToggleChaos={() => setChaosOpen((prev) => !prev)}
        requestCount={requestLogs.length}
        getShareableUrl={getShareableUrl}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 flex flex-col gap-5">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <SearchBar value={params.q} onChange={setSearch} />
        </div>

        <FilterBar
          status={params.status}
          priority={params.priority}
          region={params.region}
          category={params.category}
          onToggleStatus={toggleStatus}
          onTogglePriority={togglePriority}
          onToggleRegion={toggleRegion}
          onToggleCategory={toggleCategory}
          onReset={resetFilters}
        />

        <section aria-label="Orders Data Table" className="flex-1 flex flex-col">
          {error ? (
            <ErrorState error={error} onRetry={retry} isRetrying={isFetching} />
          ) : isFetching || isLoading ? (
            <div className="flex flex-col gap-4">
              <TableSkeletonRows rowCount={10} />
              {data && (
                <Pagination
                  meta={data.pagination}
                  onPageChange={setPage}
                  onPageSizeChange={setPageSize}
                  disabled={true}
                />
              )}
            </div>
          ) : data?.data.length === 0 ? (
            <EmptyState onReset={resetFilters} query={params.q} />
          ) : (
            data && (
              <div className="flex flex-col gap-4">
                <VirtualizedTable
                  orders={data.data}
                  sortBy={params.sortBy}
                  sortOrder={params.sortOrder}
                  onSort={setSorting}
                  onSelectOrder={setSelectedId}
                  selectedId={params.selectedId}
                  isLoading={isFetching}
                />

                <Pagination
                  meta={data.pagination}
                  onPageChange={setPage}
                  onPageSizeChange={setPageSize}
                />
              </div>
            )
          )}
        </section>
      </main>

      <ChaosSimulator
        isOpen={chaosOpen}
        onClose={() => setChaosOpen(false)}
        latency={customLatency}
        onLatencyChange={setCustomLatency}
        failRate={failRate}
        onFailRateChange={setFailRate}
        onTriggerRaceDemo={triggerRaceDemo}
        onForceFailNext={handleForceFailNext}
        forceFailActive={forceFailActive}
        requestLogs={requestLogs}
        onClearLogs={clearLogs}
        raceDemoMessage={raceDemoMessage}
      />

      <DetailDrawer
        orderId={params.selectedId}
        onClose={() => setSelectedId(null)}
        cachedOrder={selectedOrder}
      />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f5f4f0] flex items-center justify-center text-stone-500 font-mono text-sm">
          Loading Data Explorer...
        </div>
      }
    >
      <ExplorerApp />
    </Suspense>
  );
}
