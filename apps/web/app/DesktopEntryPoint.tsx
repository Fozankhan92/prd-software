import type { ReactNode } from "react";

export type DesktopEntryPointProps = {
  useNativeShell: boolean;
  nativeWorkspace: ReactNode;
  legacyWorkspace: ReactNode;
};

export function DesktopEntryPoint({
  useNativeShell,
  nativeWorkspace,
  legacyWorkspace,
}: DesktopEntryPointProps) {
  return useNativeShell ? nativeWorkspace : legacyWorkspace;
}
