import * as fs from 'fs';
import * as path from 'path';
import * as handlebars from 'handlebars';
import { NotificationChannel, NotificationType } from '../types';

// Interface simplificada para templates
interface SimpleTemplate {
  _id: string;
  name: string;
  type: NotificationType;
  channel: NotificationChannel;
  subject?: string;
  content: string;
  variables: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class TemplateService {
  private static templates: Map<string, any> = new Map();
  private static readonly TEMPLATE_DIR = path.join(__dirname, '../templates');

  /**
   * Carrega um template do sistema de arquivos
   */
  private static loadTemplate(channel: NotificationChannel, templateName: string): any {
    const templateKey = `${channel}_${templateName}`;
    const templatePath = path.join(this.TEMPLATE_DIR, channel, `${templateName}.hbs`);

    try {
      const templateContent = fs.readFileSync(templatePath, 'utf-8');
      const compiledTemplate = handlebars.compile(templateContent);
      this.templates.set(templateKey, compiledTemplate);
      return compiledTemplate;
    } catch (error) {
      throw new Error(`Template not found: ${templatePath}`);
    }
  }

  /**
   * Renderiza um template com dados
   */
  static renderTemplate(
    channel: NotificationChannel,
    templateName: string,
    data: Record<string, any>
  ): string {
    const templateKey = `${channel}_${templateName}`;

    let template = this.templates.get(templateKey);
    if (!template) {
      template = this.loadTemplate(channel, templateName);
    }

    // Adicionar helpers úteis
    this.registerHelpers();

    return template(data);
  }

  /**
   * Registra helpers do Handlebars
   */
  private static registerHelpers(): void {
    // Helper para formatar data
    handlebars.registerHelper('formatDate', (date: Date | string) => {
      const d = new Date(date);
      return d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    });

    // Helper para formatar moeda
    handlebars.registerHelper('formatCurrency', (value: number) => {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value);
    });

    // Helper para capitalizar primeira letra
    handlebars.registerHelper('capitalize', (str: string) => {
      return str.charAt(0).toUpperCase() + str.slice(1);
    });
  }

  /**
   * Lista templates disponíveis
   */
  static getAvailableTemplates(): Array<{ channel: NotificationChannel; name: string }> {
    const templates: Array<{ channel: NotificationChannel; name: string }> = [];

    const channels = Object.values(NotificationChannel);

    for (const channel of channels) {
      const channelDir = path.join(this.TEMPLATE_DIR, channel);

      if (fs.existsSync(channelDir)) {
        const files = fs.readdirSync(channelDir);

        for (const file of files) {
          if (file.endsWith('.hbs')) {
            const name = file.replace('.hbs', '');
            templates.push({ channel, name });
          }
        }
      }
    }

    return templates;
  }

  /**
   * Valida se um template existe
   */
  static templateExists(channel: NotificationChannel, templateName: string): boolean {
    const templatePath = path.join(this.TEMPLATE_DIR, channel, `${templateName}.hbs`);
    return fs.existsSync(templatePath);
  }

  /**
   * Cria um template personalizado
   */
  static createCustomTemplate(
    channel: NotificationChannel,
    templateName: string,
    content: string
  ): void {
    const templatePath = path.join(this.TEMPLATE_DIR, channel, `${templateName}.hbs`);

    // Criar diretório se não existir
    const dir = path.dirname(templatePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(templatePath, content, 'utf-8');

    // Limpar cache
    const templateKey = `${channel}_${templateName}`;
    this.templates.delete(templateKey);
  }

  /**
   * Remove um template personalizado
   */
  static removeCustomTemplate(channel: NotificationChannel, templateName: string): void {
    const templatePath = path.join(this.TEMPLATE_DIR, channel, `${templateName}.hbs`);

    if (fs.existsSync(templatePath)) {
      fs.unlinkSync(templatePath);

      // Limpar cache
      const templateKey = `${channel}_${templateName}`;
      this.templates.delete(templateKey);
    }
  }

  /**
   * Cria um template (método de instância)
   */
  async createTemplate(templateData: Partial<SimpleTemplate>): Promise<SimpleTemplate> {
    // Implementar criação de template no banco de dados
    // Por enquanto, apenas cria template no sistema de arquivos
    const templateName = templateData.name || 'custom_template';
    const channel = templateData.channel || 'email';
    const content = templateData.content || '';

    TemplateService.createCustomTemplate(channel as any, templateName, content);

    // Retornar dados do template criado (simulado)
    return {
      _id: 'custom_' + Date.now(),
      name: templateName,
      type: (templateData.type as NotificationType) || 'welcome' as NotificationType,
      channel: channel as any,
      subject: templateData.subject,
      content,
      variables: templateData.variables || [],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * Busca todos os templates (método de instância)
   */
  async getAllTemplates(): Promise<SimpleTemplate[]> {
    // Implementar busca no banco de dados
    // Por enquanto, retorna templates do sistema de arquivos
    const availableTemplates = TemplateService.getAvailableTemplates();

    return availableTemplates.map(template => ({
      _id: `${template.channel}_${template.name}`,
      name: template.name,
      type: template.name as any,
      channel: template.channel,
      subject: '',
      content: '',
      variables: [],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }));
  }

  /**
   * Busca template por ID (método de instância)
   */
  async getTemplateById(id: string): Promise<SimpleTemplate | null> {
    // Implementar busca no banco de dados
    // Por enquanto, simula busca
    const templates = await this.getAllTemplates();
    return templates.find(t => t._id.toString() === id) || null;
  }

  /**
   * Atualiza template (método de instância)
   */
  async updateTemplate(id: string, updateData: Partial<SimpleTemplate>): Promise<SimpleTemplate | null> {
    // Implementar atualização no banco de dados
    // Por enquanto, apenas atualiza no sistema de arquivos se for custom
    if (updateData.content && updateData.name && updateData.channel) {
      TemplateService.createCustomTemplate(updateData.channel, updateData.name, updateData.content);
    }

    return await this.getTemplateById(id);
  }

  /**
   * Remove template (método de instância)
   */
  async deleteTemplate(id: string): Promise<boolean> {
    // Implementar remoção no banco de dados
    // Por enquanto, apenas remove do sistema de arquivos se for custom
    const templates = await this.getAllTemplates();
    const template = templates.find(t => t._id.toString() === id);

    if (template && template._id.startsWith('custom_')) {
      TemplateService.removeCustomTemplate(template.channel, template.name);
      return true;
    }

    return false;
  }
}
