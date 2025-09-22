import { NovaTurma, Turma } from '../entities/turma.js';
import { Aluno } from '../entities/aluno.js';

export class TurmaService {
    constructor(db) { this.db = db; }


    /**
     * Lista todas as turmas
     * @param {Object} params
     * @returns {Promise<Turma[]>}
     */
    async list(params = {}) {
        if (params.with && params.with.includes('alunos')) {
            const res = await this.db.query(`
                select 
                    t.id_turmas as turma_id,
                    t.nome as turma_nome,
                    t.ano_escolar as turma_ano_escolar,
                    t.quantidade_maxima as turma_quantidade_maxima,
                    t.turno as turma_turno,
                    t.serie as turma_serie,
                    t.created_at as turma_created_at,
                    t.updated_at as turma_updated_at,
                    a.id_alunos as aluno_id,
                    a.nome as aluno_nome,
                    a.cns as aluno_cns,
                    a.nascimento as aluno_nascimento,
                    a.genero as aluno_genero,
                    a.religiao as aluno_religiao,
                    a.telefone as aluno_telefone,
                    a.logradouro as aluno_logradouro,
                    a.numero as aluno_numero,
                    a.bairro as aluno_bairro,
                    a.cep as aluno_cep,
                    a.cidade as aluno_cidade,
                    a.estado as aluno_estado,
                    a.responsavel1_nome as aluno_responsavel1_nome,
                    a.responsavel1_cpf as aluno_responsavel1_cpf,
                    a.responsavel1_telefone as aluno_responsavel1_telefone,
                    a.responsavel1_parentesco as aluno_responsavel1_parentesco,
                    a.responsavel2_nome as aluno_responsavel2_nome,
                    a.responsavel2_cpf as aluno_responsavel2_cpf,
                    a.responsavel2_telefone as aluno_responsavel2_telefone,
                    a.responsavel2_parentesco as aluno_responsavel2_parentesco,
                    a.created_at as aluno_created_at,
                    a.updated_at as aluno_updated_at
                from turmas t
                left join alunos_turmas at on t.id_turmas = at.id_turma
                left join alunos a on at.id_aluno = a.id_alunos
                order by t.id_turmas
            `);

            // Group results by turma
            const turmasMap = new Map();

            res.rows.forEach(row => {
                const turmaId = row.turma_id;

                // Create turma if not exists
                if (!turmasMap.has(turmaId)) {
                    const turma = new Turma({
                        id: row.turma_id,
                        nome: row.turma_nome,
                        anoEscolar: row.turma_ano_escolar,
                        quantidadeMaxima: row.turma_quantidade_maxima,
                        turno: row.turma_turno,
                        serie: row.turma_serie,
                        createdAt: row.turma_created_at,
                        updatedAt: row.turma_updated_at
                    });
                    turma.alunos = [];
                    turmasMap.set(turmaId, turma);
                }

                // Add aluno if exists (not null from LEFT JOIN)
                if (row.aluno_id) {
                    const aluno = new Aluno({
                        id: row.aluno_id,
                        nome: row.aluno_nome,
                        cns: row.aluno_cns,
                        nascimento: row.aluno_nascimento,
                        genero: row.aluno_genero,
                        religiao: row.aluno_religiao,
                        telefone: row.aluno_telefone,
                        logradouro: row.aluno_logradouro,
                        numero: row.aluno_numero,
                        bairro: row.aluno_bairro,
                        cep: row.aluno_cep,
                        cidade: row.aluno_cidade,
                        estado: row.aluno_estado,
                        responsavel1Nome: row.aluno_responsavel1_nome,
                        responsavel1Cpf: row.aluno_responsavel1_cpf,
                        responsavel1Telefone: row.aluno_responsavel1_telefone,
                        responsavel1Parentesco: row.aluno_responsavel1_parentesco,
                        responsavel2Nome: row.aluno_responsavel2_nome,
                        responsavel2Cpf: row.aluno_responsavel2_cpf,
                        responsavel2Telefone: row.aluno_responsavel2_telefone,
                        responsavel2Parentesco: row.aluno_responsavel2_parentesco,
                        createdAt: row.aluno_created_at,
                        updatedAt: row.aluno_updated_at
                    });
                    turmasMap.get(turmaId).alunos.push(aluno);
                }
            });

            return Array.from(turmasMap.values());
        }


        const res = await this.db.query('SELECT * FROM turmas');
        return res.rows.map(r => Turma.fromObj({
            id: r.id_turmas,
            nome: r.nome,
            anoEscolar: r.ano_escolar,
            quantidadeMaxima: r.quantidade_maxima,
            turno: r.turno,
            serie: r.serie,
            createdAt: r.created_at,
            updatedAt: r.updated_at
        }));
    }

    async getById(id) {
        const res = await this.db.query('SELECT * FROM turmas WHERE id_turmas = $1', [id]);
        if (res.rows.length === 0) return null;
        const r = res.rows[0];
        return Turma.fromObj({
            id: r.id_turmas,
            nome: r.nome,
            anoEscolar: r.ano_escolar,
            quantidadeMaxima: r.quantidade_maxima,
            turno: r.turno,
            serie: r.serie,
            createdAt: r.created_at,
            updatedAt: r.updated_at
        });
    }

    async create(novaTurma) {
        const res = await this.db.query(
            'INSERT INTO turmas (nome, ano_escolar, quantidade_maxima, turno, serie) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [novaTurma.nome, novaTurma.anoEscolar, novaTurma.quantidadeMaxima, novaTurma.turno, novaTurma.serie]
        );
        const r = res.rows[0];
        return Turma.fromObj({
            id: r.id_turmas,
            nome: r.nome,
            anoEscolar: r.ano_escolar,
            quantidadeMaxima: r.quantidade_maxima,
            turno: r.turno,
            serie: r.serie,
            createdAt: r.created_at,
            updatedAt: r.updated_at
        });
    }

    async update(id, novaTurma) {
        const res = await this.db.query(
            'UPDATE turmas SET nome = $1, ano_escolar = $2, quantidade_maxima = $3, turno = $4, serie = $5 WHERE id_turmas = $6 RETURNING *',
            [novaTurma.nome, novaTurma.anoEscolar, novaTurma.quantidadeMaxima, novaTurma.turno, novaTurma.serie, id]
        );
        if (res.rows.length === 0) throw new Error('Turma não encontrada');
        const r = res.rows[0];
        return Turma.fromObj({
            id: r.id_turmas,
            nome: r.nome,
            anoEscolar: r.ano_escolar,
            quantidadeMaxima: r.quantidade_maxima,
            turno: r.turno,
            serie: r.serie,
            createdAt: r.created_at,
            updatedAt: r.updated_at
        });
    }

    async delete(id) {
        const res = await this.db.query('DELETE FROM turmas WHERE id_turmas = $1', [id]);
        if (res.rowCount === 0) throw new Error('Turma não encontrada');
    }
}