# Guia de Configuração de Certificados

## 1. Acesso
- Menu Admin → CMS → Certificados

## 2. Criar Novo Template
```
Nome: Certificado Padrão Curso
Tipo: course
Status: active
```

## 3. Elementos Obrigatórios

### Texto Principal
- Título: "CERTIFICADO DE CONCLUSÃO"
- Posição: Centro superior
- Fonte: Arial Bold, 24pt
- Cor: #1a365d (azul escuro)

### Nome do Aluno
- Variável: {{student_name}}
- Posição: Centro
- Fonte: Arial, 18pt
- Cor: #2d3748 (cinza escuro)

### Nome do Curso
- Variável: {{course_name}}
- Posição: Centro
- Fonte: Arial, 16pt
- Cor: #4a5568 (cinza médio)

### Data de Conclusão
- Variável: {{completion_date}}
- Posição: Centro inferior
- Fonte: Arial, 12pt
- Cor: #718096 (cinza claro)

## 4. Elementos Gráficos

### Logo da Empresa
- Posição: Canto superior esquerdo
- Tamanho: 80x80px
- Formato: PNG transparente

### Selo/Marca
- Posição: Canto superior direito
- Tamanho: 60x60px
- Opacidade: 80%

### Assinaturas
- Posição: Parte inferior
- Duas linhas para assinatura
- Texto: "Diretor Acadêmico" e "Coordenador"

## 5. Configurações de Geração

### Automática
- Cursos: Após 100% de conclusão
- Simulados: Após atingir nota mínima (70%)

### Manual
- Admin pode gerar individualmente
- Opção de regenerar certificados

## 6. Validação Online
- QR Code com link único
- Página de verificação pública
- Hash de segurança

## 7. Exemplo de Template JSON
```json
{
  "name": "Certificado Padrão",
  "type": "course",
  "elements": [
    {
      "type": "text",
      "content": "CERTIFICADO DE CONCLUSÃO",
      "position": {"x": 50, "y": 15},
      "style": {"font": "Arial", "size": 24, "color": "#1a365d"}
    },
    {
      "type": "variable",
      "content": "{{student_name}}",
      "position": {"x": 50, "y": 40},
      "style": {"font": "Arial", "size": 18, "color": "#2d3748"}
    }
  ]
}
```