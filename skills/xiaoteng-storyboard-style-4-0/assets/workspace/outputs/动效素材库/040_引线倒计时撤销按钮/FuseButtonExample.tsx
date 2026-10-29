import FuseButton from './FuseButton';

<FuseButton
  label="Archive"
  doneLabel="Archived"
  undoLabel="Undo"
  color="#f5f5f5"
  background="#27272a"
  fuseColor="#f5a524"
  size="md"
  radius={22}
  undoWindow={4000}
  fuse="outline"
  fuseThickness={1.5}
  crossfadeMs={200}
  commitOn="press"
  pauseOnHover
  settle="reset"
  onCommit={() => archive(item)}
  onUndo={() => restore(item)}
  onFuseEnd={() => purge(item)}
  preset="archive"
  disabled={false}
/>
