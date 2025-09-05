// Agent Service - Production implementation for multi-agent system
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface Agent {
  id: string;
  slug: string;
  name: string;
  description: string;
  systemPrompt?: string;
  initialMessage?: string;
  temperature: number;
  model: string;
}

export class AgentService {
  // Get all available agents
  static async getAvailableAgents(): Promise<Agent[]> {
    const agents = await prisma.$queryRaw`
      SELECT 
        a.id,
        a.slug,
        a.name,
        a.description,
        a.avatar_url,
        a.persona_type,
        a.personality_traits,
        a.capabilities,
        a.preferred_model as model,
        a.temperature,
        ap.system_prompt,
        ap.initial_message
      FROM agents a
      LEFT JOIN agent_prompts ap ON a.id = ap.agent_id AND ap.is_current = true
      WHERE a.is_active = true AND a.is_public = true
      ORDER BY a.name
    `;
    
    return agents;
  }

  // Get specific agent by slug
  static async getAgent(slug: string): Promise<Agent | null> {
    const result = await prisma.$queryRaw`
      SELECT 
        a.*,
        ap.system_prompt,
        ap.initial_message,
        ap.version
      FROM agents a
      LEFT JOIN agent_prompts ap ON a.id = ap.agent_id AND ap.is_current = true
      WHERE a.slug = ${slug} AND a.is_active = true
      LIMIT 1
    `;
    
    return result[0] || null;
  }

  // Create agent session
  static async createSession(userId: string, agentSlug: string) {
    const agent = await this.getAgent(agentSlug);
    if (!agent) throw new Error('Agent not found');

    const session = await prisma.$queryRaw`
      INSERT INTO agent_sessions (user_id, agent_id, status, context)
      VALUES (
        ${userId}::uuid,
        ${agent.id}::uuid,
        'active',
        ${JSON.stringify({ model: agent.model, temperature: agent.temperature })}::jsonb
      )
      RETURNING *
    `;

    return {
      sessionId: session[0].id,
      agent,
      initialMessage: agent.initialMessage
    };
  }

  // Update session with message
  static async updateSession(sessionId: string, tokens: number, cost: number) {
    await prisma.$executeRaw`
      UPDATE agent_sessions 
      SET 
        total_messages = total_messages + 1,
        total_tokens = total_tokens + ${tokens},
        total_cost = total_cost + ${cost},
        last_activity = NOW()
      WHERE id = ${sessionId}::uuid
    `;
  }

  // End session with rating
  static async endSession(sessionId: string, rating?: number, feedback?: string) {
    await prisma.$executeRaw`
      UPDATE agent_sessions 
      SET 
        status = 'completed',
        ended_at = NOW(),
        user_rating = ${rating || null},
        feedback_text = ${feedback || null}
      WHERE id = ${sessionId}::uuid
    `;
  }

  // Get agent tools
  static async getAgentTools(agentId: string) {
    return await prisma.$queryRaw`
      SELECT 
        tool_name,
        tool_type,
        description,
        function_schema
      FROM agent_tools
      WHERE agent_id = ${agentId}::uuid AND is_active = true
    `;
  }

  // Sync from GitHub (webhook endpoint)
  static async syncFromGitHub(repoUrl: string, commitSha?: string) {
    // This would fetch agent.yaml from GitHub and update database
    // Implementation depends on GitHub API integration
    
    const agent = await prisma.$queryRaw`
      UPDATE agents 
      SET 
        last_github_sync = NOW(),
        updated_at = NOW()
      WHERE github_repo_url = ${repoUrl}
      RETURNING *
    `;
    
    if (commitSha) {
      await prisma.$executeRaw`
        UPDATE agent_prompts 
        SET github_commit_sha = ${commitSha}
        WHERE agent_id = ${agent[0].id}::uuid AND is_current = true
      `;
    }
    
    return agent[0];
  }
}

export default AgentService;
