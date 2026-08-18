/**
 * RMMProvider abstraction.
 *
 * No RMM vendor is selected yet. This interface is the contract the rest of
 * the app codes against; MockRMMProvider satisfies it with fabricated data so
 * the customer portal and admin dashboard are fully demoable before a real
 * vendor (NinjaOne, Atera, Syncro, etc.) is wired in.
 *
 * When a vendor is chosen, add e.g. NinjaOneRMMProvider implementing the same
 * interface and swap it in getRMMProvider() — no other file should need to
 * change.
 */

export type RMMDeviceStatus = "green" | "yellow" | "red" | "unknown";

export type RMMDeviceInfo = {
  externalId: string;
  os?: string;
  osVersion?: string;
  lastCheckIn?: Date;
  status: RMMDeviceStatus;
  alerts: string[];
};

export interface RMMProvider {
  registerDevice(householdId: string, deviceName: string): Promise<{ externalId: string }>;
  getDevice(externalId: string): Promise<RMMDeviceInfo | null>;
  getDeviceStatus(externalId: string): Promise<RMMDeviceStatus>;
  getDeviceHealth(externalId: string): Promise<{ status: RMMDeviceStatus; details: string }>;
  getLastCheckIn(externalId: string): Promise<Date | null>;
  createRemoteSession(externalId: string): Promise<{ sessionUrl: string } | null>;
  getAlerts(externalId: string): Promise<string[]>;
  removeDevice(externalId: string): Promise<void>;
}

class MockRMMProvider implements RMMProvider {
  async registerDevice(householdId: string, deviceName: string) {
    return { externalId: `mock-${householdId}-${deviceName}-${Date.now()}` };
  }

  async getDevice(externalId: string): Promise<RMMDeviceInfo | null> {
    return {
      externalId,
      os: "Windows",
      osVersion: "11",
      lastCheckIn: new Date(),
      status: "green",
      alerts: [],
    };
  }

  async getDeviceStatus(): Promise<RMMDeviceStatus> {
    return "green";
  }

  async getDeviceHealth() {
    return { status: "green" as RMMDeviceStatus, details: "Mock data — no RMM vendor connected yet." };
  }

  async getLastCheckIn(): Promise<Date | null> {
    return new Date();
  }

  async createRemoteSession() {
    // Real implementation should return a vendor-hosted remote session link.
    return null;
  }

  async getAlerts(): Promise<string[]> {
    return [];
  }

  async removeDevice(): Promise<void> {
    return;
  }
}

let _provider: RMMProvider | null = null;

export function getRMMProvider(): RMMProvider {
  if (!_provider) _provider = new MockRMMProvider();
  return _provider;
}
