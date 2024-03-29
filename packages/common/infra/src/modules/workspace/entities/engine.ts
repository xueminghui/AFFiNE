import type { Doc as YDoc } from 'yjs';

import { Entity } from '../../../framework';
import { AwarenessEngine, BlobEngine, DocEngine } from '../../../sync';
import { throwIfAborted } from '../../../utils';
import type { WorkspaceEngineProvider } from '../providers/engine';

export class WorkspaceEngine extends Entity<{
  engineProvider: WorkspaceEngineProvider;
  yDoc: YDoc;
}> {
  doc = new DocEngine(
    this.props.engineProvider.getDocStorage(),
    this.props.engineProvider.getDocServer()
  );

  blob = new BlobEngine(
    this.props.engineProvider.getLocalBlobStorage(),
    this.props.engineProvider.getRemoteBlobStorages()
  );

  awareness = new AwarenessEngine(
    this.props.engineProvider.getAwarenessConnections()
  );

  constructor() {
    super();
    this.doc.setPriority(this.props.yDoc.guid, 100);
    this.doc.addDoc(this.props.yDoc);
  }

  start() {
    this.doc.start();
    this.awareness.connect();
    this.blob.start();
  }

  canGracefulStop() {
    return this.doc.engineState$.value.saving === 0;
  }

  async waitForGracefulStop(abort?: AbortSignal) {
    await this.doc.waitForSaved();
    throwIfAborted(abort);
    this.forceStop();
  }

  forceStop() {
    this.doc.stop();
    this.awareness.disconnect();
    this.blob.stop();
  }

  docEngineState$ = this.doc.engineState$;

  rootDocState$ = this.doc.docState$(this.props.yDoc.guid);

  waitForDocSynced() {
    return this.doc.waitForSynced();
  }

  waitForRootDocReady() {
    return this.doc.waitForReady(this.props.yDoc.guid);
  }

  override dispose(): void {
    this.forceStop();
  }
}
