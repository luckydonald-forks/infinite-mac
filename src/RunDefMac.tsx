import {useEffect, useState} from "react";
import {
    type EmulatorCDROMLibrary,
    type EmulatorCDROM,
} from "./emulator/emulator-common";
import {fetchCDROMInfo} from "./cdroms";
import cdromsManifest from "./Data/CD-ROMs.json";
import {type RunDef} from "./run-def";
import Mac from "./Mac";

export default function RunDefMac({
    runDef,
    onDone,
}: {
    runDef: RunDef;
    onDone: () => void;
}) {
    const [cdroms, setCDROMs] = useState<EmulatorCDROM[] | undefined>(
        runDef.cdromURLs.length ? undefined : []
    );
    const [cdromErrorText, setCDROMErrorText] = useState<string | undefined>(
        undefined
    );
    useEffect(() => {
        if (runDef.cdromURLs.length) {
            Promise.all(runDef.cdromURLs.map(fetchCDROMInfo))
                .then(setCDROMs)
                .catch(error => {
                    setCDROMErrorText(`Could not load the CD-ROM: ${error}`);
                    setCDROMs([]);
                });
        }
    }, [runDef.cdromURLs]);
    runDef.disks.forEach(disk => disk.generatedSpec()); // Prefetch the disk definition
    return cdroms ? (
        <Mac
            disks={runDef.disks}
            includeInfiniteHD={runDef.includeInfiniteHD}
            cdroms={cdroms}
            initialErrorText={cdromErrorText}
            machine={runDef.machine}
            ethernetProvider={runDef.ethernetProvider}
            debugFallback={runDef.debugFallback}
            debugAudio={runDef.debugAudio}
            cdromLibrary={cdromsManifest as any as EmulatorCDROMLibrary}
            onDone={onDone}
        />
    ) : (
        <div style={{color: "#aaa"}}>Loading CD-ROM Metadata…</div>
    );
}
