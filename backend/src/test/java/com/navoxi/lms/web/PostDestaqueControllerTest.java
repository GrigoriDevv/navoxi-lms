package com.navoxi.lms.web;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.navoxi.lms.domain.entity.Post;
import com.navoxi.lms.domain.enums.PostStatus;
import com.navoxi.lms.domain.enums.Role;
import com.navoxi.lms.domain.enums.UnitId;
import com.navoxi.lms.repository.DestaqueRepository;
import com.navoxi.lms.repository.PostRepository;
import com.navoxi.lms.repository.UserAccountRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest(
    properties = {
      "spring.datasource.url=jdbc:h2:mem:lms-posts-destaques;MODE=PostgreSQL;DB_CLOSE_DELAY=-1;DATABASE_TO_LOWER=TRUE",
      "lms.seed.enabled=false"
    })
@AutoConfigureMockMvc
@ActiveProfiles("local")
@Transactional
class PostDestaqueControllerTest {

  private static final String POST_BODY =
      """
      {
        "title": "Campanha de Segurança",
        "body": "Reforce as boas práticas.",
        "unitId": "matriz"
      }
      """;

  private static final String DESTAQUE_BODY =
      """
      {
        "title": "Novo curso ESG",
        "body": "Inscreva-se na trilha.",
        "unitId": "matriz",
        "visible": true,
        "pinned": true
      }
      """;

  @Autowired private MockMvc mockMvc;
  @Autowired private ObjectMapper objectMapper;
  @Autowired private UserAccountRepository users;
  @Autowired private PostRepository posts;
  @Autowired private DestaqueRepository destaques;
  @Autowired private PasswordEncoder passwordEncoder;

  private String alunoJwt;
  private String adminJwt;
  private String nordesteJwt;

  @BeforeEach
  void seed() throws Exception {
    destaques.deleteAll();
    posts.deleteAll();
    users.deleteAll();
    LearningTestFixtures.saveUser(
        users, passwordEncoder, "u-aluno", "aluno@navoxi.com", Role.aluno, "secret123");
    LearningTestFixtures.saveUser(
        users, passwordEncoder, "u-admin", "admin@navoxi.com", Role.admin_premium, "secret123");
    LearningTestFixtures.saveUser(
        users,
        passwordEncoder,
        "u-ne",
        "admin.ne@navoxi.com",
        Role.admin_unidade,
        UnitId.nordeste,
        "secret123");
    alunoJwt =
        AuthTestSupport.loginAccessToken(mockMvc, objectMapper, "aluno@navoxi.com", "secret123");
    adminJwt =
        AuthTestSupport.loginAccessToken(mockMvc, objectMapper, "admin@navoxi.com", "secret123");
    nordesteJwt =
        AuthTestSupport.loginAccessToken(
            mockMvc, objectMapper, "admin.ne@navoxi.com", "secret123");
  }

  @Test
  void createPostForbiddenForAluno() throws Exception {
    mockMvc
        .perform(
            post("/api/v1/posts")
                .header("Authorization", "Bearer " + alunoJwt)
                .contentType(MediaType.APPLICATION_JSON)
                .content(POST_BODY))
        .andExpect(status().isForbidden());
  }

  @Test
  void alunoListsPostsFromOwnUnit() throws Exception {
    createPost("Comunicado para colaboradores");

    mockMvc
        .perform(get("/api/v1/posts").header("Authorization", "Bearer " + alunoJwt))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()").value(1))
        .andExpect(jsonPath("$[0].title").value("Comunicado para colaboradores"));
  }

  @Test
  void createAndListPostsForAdmin() throws Exception {
    mockMvc
        .perform(
            post("/api/v1/posts")
                .header("Authorization", "Bearer " + adminJwt)
                .contentType(MediaType.APPLICATION_JSON)
                .content(POST_BODY))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.title").value("Campanha de Segurança"))
        .andExpect(jsonPath("$.status").value("publicado"))
        .andExpect(jsonPath("$.author").isNotEmpty());

    mockMvc
        .perform(get("/api/v1/posts").header("Authorization", "Bearer " + adminJwt))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()").value(1));
  }

  @Test
  void patchPostPreservesOmittedFields() throws Exception {
    String id =
        objectMapper
            .readTree(
                mockMvc
                    .perform(
                        post("/api/v1/posts")
                            .header("Authorization", "Bearer " + adminJwt)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(POST_BODY))
                    .andExpect(status().isCreated())
                    .andReturn()
                    .getResponse()
                    .getContentAsString())
            .get("id")
            .asText();

    mockMvc
        .perform(
            patch("/api/v1/posts/" + id)
                .header("Authorization", "Bearer " + adminJwt)
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    { "title": "Título atualizado" }
                    """))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.title").value("Título atualizado"))
        .andExpect(jsonPath("$.body").value("Reforce as boas práticas."))
        .andExpect(jsonPath("$.status").value("publicado"));
  }

  @Test
  void unitAdminCannotGetForeignPost() throws Exception {
    Post p = new Post();
    p.setId("post-matriz");
    p.setTitle("Só matriz");
    p.setBody("Corpo");
    p.setAuthor("Admin");
    p.setUnitId(UnitId.matriz);
    p.setStatus(PostStatus.publicado);
    p.setPublishedAt("2026-06-10 09:00");
    posts.save(p);

    mockMvc
        .perform(get("/api/v1/posts/post-matriz").header("Authorization", "Bearer " + nordesteJwt))
        .andExpect(status().isForbidden());
  }

  @Test
  void unitAdminListsOnlyOwnUnitPosts() throws Exception {
    Post matriz = new Post();
    matriz.setId("post-m");
    matriz.setTitle("Matriz");
    matriz.setBody("b");
    matriz.setAuthor("A");
    matriz.setUnitId(UnitId.matriz);
    matriz.setStatus(PostStatus.publicado);
    matriz.setPublishedAt("2026-06-10 09:00");
    posts.save(matriz);

    Post nordeste = new Post();
    nordeste.setId("post-ne");
    nordeste.setTitle("Nordeste");
    nordeste.setBody("b");
    nordeste.setAuthor("A");
    nordeste.setUnitId(UnitId.nordeste);
    nordeste.setStatus(PostStatus.publicado);
    nordeste.setPublishedAt("2026-06-10 09:00");
    posts.save(nordeste);

    mockMvc
        .perform(get("/api/v1/posts").header("Authorization", "Bearer " + nordesteJwt))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()").value(1))
        .andExpect(jsonPath("$[0].id").value("post-ne"));
  }

  @Test
  void listsPostsFromNewestToOldest() throws Exception {
    createPost("Post mais antigo");
    Thread.sleep(5);
    createPost("Post mais recente");

    mockMvc
        .perform(get("/api/v1/posts").header("Authorization", "Bearer " + adminJwt))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].title").value("Post mais recente"))
        .andExpect(jsonPath("$[1].title").value("Post mais antigo"));
  }

  private void createPost(String title) throws Exception {
    mockMvc
        .perform(
            post("/api/v1/posts")
                .header("Authorization", "Bearer " + adminJwt)
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {
                      "title": "%s",
                      "body": "Conteúdo",
                      "unitId": "matriz"
                    }
                    """
                        .formatted(title)))
        .andExpect(status().isCreated());
  }

  @Test
  void createDestaqueForbiddenForAluno() throws Exception {
    mockMvc
        .perform(
            post("/api/v1/destaques")
                .header("Authorization", "Bearer " + alunoJwt)
                .contentType(MediaType.APPLICATION_JSON)
                .content(DESTAQUE_BODY))
        .andExpect(status().isForbidden());
  }

  @Test
  void createListAndPatchDestaqueForAdmin() throws Exception {
    String id =
        objectMapper
            .readTree(
                mockMvc
                    .perform(
                        post("/api/v1/destaques")
                            .header("Authorization", "Bearer " + adminJwt)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(DESTAQUE_BODY))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.pinned").value(true))
                    .andExpect(jsonPath("$.visible").value(true))
                    .andReturn()
                    .getResponse()
                    .getContentAsString())
            .get("id")
            .asText();

    mockMvc
        .perform(get("/api/v1/destaques").header("Authorization", "Bearer " + adminJwt))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()").value(1));

    mockMvc
        .perform(
            patch("/api/v1/destaques/" + id)
                .header("Authorization", "Bearer " + adminJwt)
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    { "visible": false }
                    """))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.visible").value(false))
        .andExpect(jsonPath("$.pinned").value(true))
        .andExpect(jsonPath("$.title").value("Novo curso ESG"));
  }

  @Test
  void listPostsRequiresAuth() throws Exception {
    mockMvc.perform(get("/api/v1/posts")).andExpect(status().isUnauthorized());
  }
}
