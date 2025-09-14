import { DisciplinaService } from '../services/disciplina.service.js';
import { ProfessorService } from '../services/professor.service.js'
import { SecretariaService } from '../services/secretaria.service.js'
import { UsuarioService } from '../services/usuario.service.js';


/**
 * Função utilizada para popular o banco de dados com dados iniciais
 *
 * @param {import('pg').Pool} db
 * @param {import('../services/hashing.service.js').HashingService} hashingService
 * @returns {Promise<void>}
 */
export async function seed(db, hashingService) {
    if (process.env.SEED_DB !== "true") {
        console.log("Seeding desativado");
        return;
    }

    const usuarioService = new UsuarioService(db, hashingService);
    const disciplinaService = new DisciplinaService(db);

    const professorService = new ProfessorService(db, usuarioService);
    const secretariaService = new SecretariaService(db, usuarioService);

    const professorUsuario = await usuarioService.create({
        nome: "Admin Professor",
        email: "admin.professor@example.com",
        senha: "senha123",
        tipo_usuario: "professor"
    });

    const secretariaUsuario = await usuarioService.create({
        nome: "Admin Secretaria",
        email: "admin.secretaria@example.com",
        senha: "senha123",
        tipo_usuario: "secretaria"
    });

    const disciplina = await disciplinaService.create({
        nome: "Matemática"
    });

    const professor = await professorService.create({
        idUsuario: professorUsuario.id,
        idDisciplinaEspecialidade: disciplina.id,
        telefone: "123456789",
        genero: "Masculino",
        cpf: "123.456.789-00",
        nascimento: "1980-01-01",
        logradouro: "Rua A",
        numero: "100",
        bairro: "Centro",
        cep: "12345-678",
        cidade: "Cidade Exemplo",
        estado: "EX",
        formacaoAcademica: "Mestrado em Educação"
    });

    const secretaria = await secretariaService.create({
        idUsuario: secretariaUsuario.id,
    });

    console.log("Seeding iniciado");
    console.log("Disciplina criada:", disciplina);
    console.log("Secretaria criada:", secretaria);

    console.log("Seeding concluído");
    console.log("Professor criado:", professor);
}