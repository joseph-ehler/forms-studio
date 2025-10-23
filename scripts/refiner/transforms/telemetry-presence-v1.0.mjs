/**
 * Refiner Transform: Telemetry Presence v1.0
 * 
 * When spec enables telemetry, verify the component imports telemetryAdapter.
 * Prevents drift where spec says "telemetry enabled" but code doesn't wire it.
 * 
 * Rule: If spec.telemetry.enabled, component must import telemetryAdapter
 * 
 * Note: This is a simple regex check (doesn't need AST parsing)
 */

export function telemetryPresenceV1_0() {
  return {
    name: 'telemetry-presence-v1.0',
    apply: async ({ file, code }) => {
      const issues = [];
      
      // Simple check: if file has telemetry comment marker, verify import exists
      // (Generator adds "⚡ Telemetry enabled" comment when telemetry.enabled)
      const hasTelemetryMarker = code.includes('⚡ Telemetry enabled');
      
      if (hasTelemetryMarker) {
        const hasTelemetryImport = code.includes("telemetryAdapter");
        
        if (!hasTelemetryImport) {
          issues.push({
            message: 'Telemetry enabled but telemetryAdapter not imported. Add: import { telemetryAdapter } from \'./adapters\';',
          });
        }
      }
      
      return {
        changed: false, // Report-only for now
        code,
        issues,
      };
    },
  };
}
