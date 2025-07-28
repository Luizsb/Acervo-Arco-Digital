/*
  # Criar tabela de conteúdos educacionais

  1. Nova Tabela
    - `educational_content`
      - `id` (uuid, primary key)
      - `nome_conteudo` (text, nome do conteúdo)
      - `tipo_conteudo` (text, ODA ou videoaula)
      - `tags` (text[], array de tags)
      - `bncc` (text, código BNCC)
      - `tipo_ensino` (text, tipo de ensino)
      - `disciplina` (text, disciplina)
      - `url_conteudo` (text, URL do conteúdo)
      - `thumbnail_url` (text, URL da thumbnail)
      - `created_at` (timestamp)

  2. Segurança
    - Habilitar RLS na tabela `educational_content`
    - Adicionar política para leitura pública dos conteúdos
    - Adicionar política para inserção/edição por usuários autenticados

  3. Dados de exemplo
    - Inserir conteúdos de exemplo para demonstração
*/

-- Criar tabela de conteúdos educacionais
CREATE TABLE IF NOT EXISTS educational_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_conteudo text NOT NULL,
  tipo_conteudo text NOT NULL CHECK (tipo_conteudo IN ('ODA', 'videoaula')),
  tags text[] DEFAULT '{}',
  bncc text NOT NULL,
  tipo_ensino text NOT NULL,
  disciplina text NOT NULL,
  url_conteudo text NOT NULL,
  thumbnail_url text,
  created_at timestamptz DEFAULT now()
);

-- Habilitar Row Level Security
ALTER TABLE educational_content ENABLE ROW LEVEL SECURITY;

-- Política para leitura pública dos conteúdos
CREATE POLICY "Conteúdos são visíveis publicamente"
  ON educational_content
  FOR SELECT
  TO public
  USING (true);

-- Política para inserção por usuários autenticados
CREATE POLICY "Usuários autenticados podem inserir conteúdos"
  ON educational_content
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Política para atualização por usuários autenticados
CREATE POLICY "Usuários autenticados podem atualizar conteúdos"
  ON educational_content
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Política para exclusão por usuários autenticados
CREATE POLICY "Usuários autenticados podem excluir conteúdos"
  ON educational_content
  FOR DELETE
  TO authenticated
  USING (true);

-- Inserir dados de exemplo
INSERT INTO educational_content (nome_conteudo, tipo_conteudo, tags, bncc, tipo_ensino, disciplina, url_conteudo, thumbnail_url) VALUES
(
  'Geometria Espacial Interativa',
  'ODA',
  ARRAY['interativo', 'visualização', '3D', 'matemática', 'geometria'],
  'EF07MA31',
  'Fundamental II',
  'Matemática',
  'https://example.com/geometria-espacial',
  'https://images.pexels.com/photos/8923841/pexels-photo-8923841.jpeg?auto=compress&cs=tinysrgb&w=800'
),
(
  'Fotossíntese - Processo Completo',
  'videoaula',
  ARRAY['animação', 'biologia', 'plantas', 'educativo'],
  'EF06CI05',
  'Fundamental II',
  'Ciências',
  'https://example.com/fotossintese',
  'https://images.pexels.com/photos/1059120/pexels-photo-1059120.jpeg?auto=compress&cs=tinysrgb&w=800'
),
(
  'História do Brasil Colonial',
  'videoaula',
  ARRAY['história', 'colonial', 'brasil', 'documentário', 'educativo'],
  'EF07HI09',
  'Fundamental II',
  'História',
  'https://example.com/brasil-colonial',
  'https://images.pexels.com/photos/4439901/pexels-photo-4439901.jpeg?auto=compress&cs=tinysrgb&w=800'
),
(
  'Simulador de Circuitos Elétricos',
  'ODA',
  ARRAY['simulação', 'física', 'eletrônica', 'interativo'],
  'EM13CNT301',
  'Médio',
  'Física',
  'https://example.com/circuitos-eletricos',
  'https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg?auto=compress&cs=tinysrgb&w=800'
),
(
  'Átomos e Moléculas',
  'ODA',
  ARRAY['química', 'átomos', 'interativo', 'simulação', 'laboratório'],
  'EF09CI02',
  'Fundamental II',
  'Química',
  'https://example.com/atomos-moleculas',
  'https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg?auto=compress&cs=tinysrgb&w=800'
),
(
  'Literatura Brasileira Contemporânea',
  'videoaula',
  ARRAY['literatura', 'brasil', 'contemporâneo', 'análise'],
  'EM13LP46',
  'Médio',
  'Português',
  'https://example.com/literatura-contemporanea',
  'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=800'
),
(
  'Equações do Segundo Grau',
  'ODA',
  ARRAY['matemática', 'álgebra', 'equações', 'interativo', 'gráficos'],
  'EF09MA09',
  'Fundamental II',
  'Matemática',
  'https://example.com/equacoes-segundo-grau',
  'https://images.pexels.com/photos/6238297/pexels-photo-6238297.jpeg?auto=compress&cs=tinysrgb&w=800'
),
(
  'Sistema Solar e Planetas',
  'videoaula',
  ARRAY['astronomia', 'planetas', 'sistema solar', 'ciências', 'universo'],
  'EF05CI11',
  'Fundamental I',
  'Ciências',
  'https://example.com/sistema-solar',
  'https://images.pexels.com/photos/87651/earth-blue-planet-globe-planet-87651.jpeg?auto=compress&cs=tinysrgb&w=800'
),
(
  'Revolução Industrial',
  'videoaula',
  ARRAY['história', 'revolução', 'industrial', 'sociedade', 'tecnologia'],
  'EF08HI03',
  'Fundamental II',
  'História',
  'https://example.com/revolucao-industrial',
  'https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg?auto=compress&cs=tinysrgb&w=800'
),
(
  'Simulador de Reações Químicas',
  'ODA',
  ARRAY['química', 'reações', 'simulação', 'laboratório', 'experimentos'],
  'EM13CNT207',
  'Médio',
  'Química',
  'https://example.com/reacoes-quimicas',
  'https://images.pexels.com/photos/2280549/pexels-photo-2280549.jpeg?auto=compress&cs=tinysrgb&w=800'
),
(
  'Gramática: Classes de Palavras',
  'videoaula',
  ARRAY['português', 'gramática', 'classes', 'palavras', 'linguagem'],
  'EF06LP04',
  'Fundamental II',
  'Português',
  'https://example.com/classes-palavras',
  'https://images.pexels.com/photos/261763/pexels-photo-261763.jpeg?auto=compress&cs=tinysrgb&w=800'
),
(
  'Frações e Números Decimais',
  'ODA',
  ARRAY['matemática', 'frações', 'decimais', 'interativo', 'números'],
  'EF05MA03',
  'Fundamental I',
  'Matemática',
  'https://example.com/fracoes-decimais',
  'https://images.pexels.com/photos/6238297/pexels-photo-6238297.jpeg?auto=compress&cs=tinysrgb&w=800'
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_educational_content_tipo_conteudo ON educational_content(tipo_conteudo);
CREATE INDEX IF NOT EXISTS idx_educational_content_disciplina ON educational_content(disciplina);
CREATE INDEX IF NOT EXISTS idx_educational_content_tipo_ensino ON educational_content(tipo_ensino);
CREATE INDEX IF NOT EXISTS idx_educational_content_bncc ON educational_content(bncc);
CREATE INDEX IF NOT EXISTS idx_educational_content_tags ON educational_content USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_educational_content_nome ON educational_content USING GIN(to_tsvector('portuguese', nome_conteudo));