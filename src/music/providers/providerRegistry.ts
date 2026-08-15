import { MusicProvider, MusicProviderId } from "./types";
import { aceStepProvider } from "./aceStepProvider";
import { synthFallbackProvider } from "./synthFallbackProvider";

class MusicProviderRegistry {
  private providers: Map<MusicProviderId, MusicProvider> = new Map();

  constructor() {
    this.registerProvider(aceStepProvider);
    this.registerProvider(synthFallbackProvider);
  }

  public registerProvider(provider: MusicProvider): void {
    this.providers.set(provider.id, provider);
  }

  public getProvider(id: MusicProviderId): MusicProvider | undefined {
    return this.providers.get(id);
  }

  public getAllProviders(): MusicProvider[] {
    return Array.from(this.providers.values());
  }

  public getDefaultProvider(): MusicProvider {
    return this.providers.get("acestep_hf") || synthFallbackProvider;
  }
}

export const musicProviderRegistry = new MusicProviderRegistry();
