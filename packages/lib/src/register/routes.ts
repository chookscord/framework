const GATEWAY = 'https://discord.com/api/v8/applications';

export function global(applicationId: string): string {
  return `${GATEWAY}/${applicationId}/commands`;
}

export function guild(applicationId: string, guildId: string): string {
  return `${GATEWAY}/${applicationId}/guilds/${guildId}/commands`;
}
