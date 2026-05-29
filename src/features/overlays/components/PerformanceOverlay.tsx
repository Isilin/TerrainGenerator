import type { PerfStats } from '../../terrain/types'
import styles from './Overlays.module.css'

export function PerformanceOverlay({ stats }: { stats: PerfStats }) {
  return (
    <aside className={styles.perfOverlay} aria-live="polite">
      <h2>Perf Debug</h2>
      <dl>
        <div>
          <dt>FPS</dt>
          <dd>{stats.fps.toFixed(1)}</dd>
        </div>
        <div>
          <dt>Chunk center</dt>
          <dd>
            {stats.centerChunkX}, {stats.centerChunkZ}
          </dd>
        </div>
        <div>
          <dt>Chunks visibles</dt>
          <dd>{stats.visibleChunks}</dd>
        </div>
        <div>
          <dt>Chunks charges</dt>
          <dd>{stats.loadedChunks}</dd>
        </div>
        <div>
          <dt>Req. en vol</dt>
          <dd>{stats.inFlightRequests}</dd>
        </div>
        <div>
          <dt>Cache LRU</dt>
          <dd>{stats.cacheSize}</dd>
        </div>
      </dl>
    </aside>
  )
}
