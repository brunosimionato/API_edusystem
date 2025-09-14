CREATE TABLE usuarios (
    id_usuarios SERIAL,

    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    hash_senha VARCHAR(100) NOT NULL, -- por favor não deixar senhas no banco
    tipo_usuario VARCHAR(20) NOT NULL, -- redundante?

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT PK_usuarios PRIMARY KEY (id_usuarios)
);

CREATE TABLE alunos (
    id_alunos SERIAL,

    nome VARCHAR(150) NOT NULL,
    cns VARCHAR(20) NOT NULL,
    nascimento DATE NOT NULL,
    genero VARCHAR(20) NOT NULL,
    religiao VARCHAR(100),
    telefone VARCHAR(20) NOT NULL,
    logradouro VARCHAR(150) NOT NULL,
    numero VARCHAR(10) NOT NULL,
    bairro VARCHAR(100) NOT NULL,
    cep VARCHAR(10) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    estado VARCHAR(2) NOT NULL,           
    responsavel1_nome VARCHAR(150) NOT NULL,
    responsavel1_cpf VARCHAR(14) NOT NULL,
    responsavel1_telefone VARCHAR(20) NOT NULL,
    responsavel1_parentesco VARCHAR(50) NOT NULL,
    responsavel2_nome VARCHAR(150),
    responsavel2_cpf VARCHAR(14),
    responsavel2_telefone VARCHAR(20),
    responsavel2_parentesco VARCHAR(50),

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT PK_alunos PRIMARY KEY (id_alunos)
);

CREATE TABLE disciplinas (
    id_disciplinas SERIAL,

    nome VARCHAR(50) NOT NULL UNIQUE,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT PK_disciplinas PRIMARY KEY (id_disciplinas)
);

CREATE TABLE professores (
    id_professores SERIAL,
    id_usuario INTEGER NOT NULL,
    id_disciplina_especialidade INTEGER NOT NULL,

    telefone VARCHAR(20) NOT NULL,
    genero VARCHAR(20) NOT NULL,
    cpf VARCHAR(14) NOT NULL,
    nascimento DATE NOT NULL,

    logradouro VARCHAR(150) NOT NULL,
    numero VARCHAR(10) NOT NULL,
    bairro VARCHAR(100) NOT NULL,
    cep VARCHAR(10) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    estado VARCHAR(2) NOT NULL,           

    formacao_academica VARCHAR(200) NOT NULL,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT PK_professores PRIMARY KEY (id_professores),
    CONSTRAINT FK_professores_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuarios),
    CONSTRAINT FK_professores_disciplina FOREIGN KEY (id_disciplina_especialidade) REFERENCES disciplinas(id_disciplinas)
);

CREATE TABLE secretarias (
    id_secretarias SERIAL,
    id_usuario INTEGER NOT NULL,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT PK_secretarias PRIMARY KEY (id_secretarias),
    CONSTRAINT FK_secretarias_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuarios)
);

CREATE TABLE turmas (
    id_turmas SERIAL,

    nome VARCHAR(50) NOT NULL,
    ano_escolar INT NOT NULL,
    serie VARCHAR(50) NOT NULL,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT PK_turmas PRIMARY KEY (id_turmas)
);

CREATE TABLE professores_disciplinas (
    id_professores_disciplinas SERIAL,
    id_professor INTEGER NOT NULL,
    id_disciplina INTEGER NOT NULL,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT PK_professores_disciplinas PRIMARY KEY (id_professores_disciplinas),
    CONSTRAINT FK_professores_disciplinas_professor FOREIGN KEY (id_professor) REFERENCES professores(id_professores),
    CONSTRAINT FK_professores_disciplinas_disciplina FOREIGN KEY (id_disciplina) REFERENCES disciplinas(id_disciplinas)
);

CREATE TABLE alunos_turmas (
    id_alunos_turmas SERIAL,
    id_aluno INTEGER NOT NULL,
    id_turma INTEGER NOT NULL,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT PK_alunos_turmas PRIMARY KEY (id_alunos_turmas),
    CONSTRAINT FK_alunos_turmas_aluno FOREIGN KEY (id_aluno) REFERENCES alunos(id_alunos),
    CONSTRAINT FK_alunos_turmas_turma FOREIGN KEY (id_turma) REFERENCES turmas(id_turmas)
);

CREATE TABLE notas (
    id_notas SERIAL,
    id_aluno INTEGER NOT NULL,
    id_disciplina INTEGER NOT NULL,
    id_turma INTEGER NOT NULL,

    nota DECIMAL(4,2),
    bimestre INTEGER,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT PK_notas PRIMARY KEY (id_notas),
    CONSTRAINT FK_notas_aluno FOREIGN KEY (id_aluno) REFERENCES alunos(id_alunos),
    CONSTRAINT FK_notas_disciplina FOREIGN KEY (id_disciplina) REFERENCES disciplinas(id_disciplinas),
    CONSTRAINT FK_notas_turma FOREIGN KEY (id_turma) REFERENCES turmas(id_turmas)
);

CREATE TABLE disciplinas_notas (
    id_notas SERIAL,
    id_aluno INT NOT NULL,
    id_disciplina INT NOT NULL,

    ano_letivo INT NOT NULL,
    nota NUMERIC(5,2) NOT NULL,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT PK_disciplinas_notas PRIMARY KEY (id_notas),
    CONSTRAINT FK_disciplinas_notas_aluno FOREIGN KEY (id_aluno) REFERENCES alunos(id_alunos),
    CONSTRAINT FK_disciplinas_notas_disciplina FOREIGN KEY (id_disciplina) REFERENCES disciplinas(id_disciplinas)
);

CREATE TABLE anos_escolares (
    id_anos_escolares SERIAL,

    nome VARCHAR(50) NOT NULL UNIQUE,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT PK_id_anos_escolares PRIMARY KEY (id_anos_escolares)
);

CREATE TABLE historicos_escolares (
    id_historicos_escolares SERIAL,
    id_aluno INT NOT NULL,
    id_ano_escolar INT NOT NULL,

    nome_escola VARCHAR(150) NOT NULL,
    serie_concluida VARCHAR(50) NOT NULL,
    nota NUMERIC(5,2) NOT NULL,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT PK_id_historicos_escolares PRIMARY KEY (id_historicos_escolares),
    CONSTRAINT FK_historicos_escolares_aluno FOREIGN KEY (id_aluno) REFERENCES alunos(id_alunos),
    CONSTRAINT FK_historicos_escolares_ano_escolar FOREIGN KEY (id_ano_escolar) REFERENCES anos_escolares(id_anos_escolares)
);

CREATE TABLE faltas (
    id_faltas SERIAL,
    id_aluno INTEGER NOT NULL,
    id_disciplina INTEGER NOT NULL,

    data_falta DATE,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT PK_faltas PRIMARY KEY (id_faltas),
    CONSTRAINT FK_faltas_aluno FOREIGN KEY (id_aluno) REFERENCES alunos(id_alunos),
    CONSTRAINT FK_faltas_disciplina FOREIGN KEY (id_disciplina) REFERENCES disciplinas(id_disciplinas)
);

CREATE TABLE recados (
    id_recados SERIAL,
    id_professor INTEGER NOT NULL,
    id_turma INTEGER NOT NULL,

    titulo VARCHAR(100),
    mensagem TEXT,
    data_envio DATE DEFAULT CURRENT_DATE,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT PK_recados PRIMARY KEY (id_recados),
    CONSTRAINT FK_recados_professor FOREIGN KEY (id_professor) REFERENCES professores(id_professores),
    CONSTRAINT FK_recados_turma FOREIGN KEY (id_turma) REFERENCES turmas(id_turmas)
);

CREATE TABLE tarefas (
    id_tarefas SERIAL,
    id_professor INTEGER NOT NULL,
    id_turma INTEGER NOT NULL,
    id_disciplina INTEGER NOT NULL,

    titulo VARCHAR(100) NOT NULL,
    descricao TEXT,
    data_entrega DATE,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT PK_tarefas PRIMARY KEY (id_tarefas),
    CONSTRAINT FK_tarefas_professor FOREIGN KEY (id_professor) REFERENCES professores(id_professores),
    CONSTRAINT FK_tarefas_turma FOREIGN KEY (id_turma) REFERENCES turmas(id_turmas),
    CONSTRAINT FK_tarefas_disciplina FOREIGN KEY (id_disciplina) REFERENCES disciplinas(id_disciplinas)
);

CREATE TABLE entregas_tarefas (
    id_entregas_tarefas SERIAL,
    id_tarefa INTEGER NOT NULL,
    id_aluno INTEGER NOT NULL,

    data_entrega TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    conteudo TEXT,
    nota DECIMAL(4,2),

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT PK_entregas_tarefas PRIMARY KEY (id_entregas_tarefas),
    CONSTRAINT FK_entregas_tarefas_tarefa FOREIGN KEY (id_tarefa) REFERENCES tarefas(id_tarefas),
    CONSTRAINT FK_entregas_tarefas_aluno FOREIGN KEY (id_aluno) REFERENCES alunos(id_alunos)
);

CREATE TABLE materiais_didaticos (
    id_materiais_didaticos SERIAL,
    id_professor INTEGER NOT NULL,
    id_turma INTEGER NOT NULL,
    id_disciplina INTEGER NOT NULL,

    titulo VARCHAR(100),
    descricao TEXT,
    link_arquivo TEXT,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT PK_materiais_didaticos PRIMARY KEY (id_materiais_didaticos),
    CONSTRAINT FK_materiais_didaticos_professor FOREIGN KEY (id_professor) REFERENCES professores(id_professores),
    CONSTRAINT FK_materiais_didaticos_turma FOREIGN KEY (id_turma) REFERENCES turmas(id_turmas),
    CONSTRAINT FK_materiais_didaticos_disciplina FOREIGN KEY (id_disciplina) REFERENCES disciplinas(id_disciplinas)
);

CREATE TABLE horarios_aulas (
    id_horarios_aulas SERIAL,
    id_turma INTEGER NOT NULL,
    id_disciplina INTEGER NOT NULL,
    id_professor INTEGER NOT NULL,

    dia_semana VARCHAR(10),
    horario_inicio TIME,
    horario_fim TIME,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT PK_horarios_aulas PRIMARY KEY (id_horarios_aulas),
    CONSTRAINT FK_horarios_aulas_turma FOREIGN KEY (id_turma) REFERENCES turmas(id_turmas),
    CONSTRAINT FK_horarios_aulas_disciplina FOREIGN KEY (id_disciplina) REFERENCES disciplinas(id_disciplinas),
    CONSTRAINT FK_horarios_aulas_professor FOREIGN KEY (id_professor) REFERENCES professores(id_professores)
);

CREATE TABLE avisos_gerais (
    id_avisos_gerais SERIAL,
    id_usuario_autor INTEGER NOT NULL,

    titulo VARCHAR(100),
    mensagem TEXT,
    data_envio DATE DEFAULT CURRENT_DATE,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT PK_avisos_gerais PRIMARY KEY (id_avisos_gerais),
    CONSTRAINT FK_avisos_gerais_usuario_autor FOREIGN KEY (id_usuario_autor) REFERENCES usuarios(id_usuarios)
);

CREATE TABLE ocorrencias (
    id_ocorrencias SERIAL,
    id_aluno INTEGER NOT NULL,
    id_usuario_registrador INTEGER NOT NULL,

    data_ocorrencia DATE,
    descricao TEXT,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT PK_ocorrencias PRIMARY KEY (id_ocorrencias),
    CONSTRAINT FK_ocorrencias_aluno FOREIGN KEY (id_aluno) REFERENCES alunos(id_alunos),
    CONSTRAINT FK_ocorrencias_usuario_registrador FOREIGN KEY (id_usuario_registrador) REFERENCES usuarios(id_usuarios)
);
