using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QuizBuilder.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "admin_users",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    username = table.Column<string>(type: "text", nullable: false),
                    password_hash = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_admin_users", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "quizzes",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    title = table.Column<string>(type: "text", nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    is_graded = table.Column<bool>(type: "boolean", nullable: false),
                    shuffle_questions = table.Column<bool>(type: "boolean", nullable: true),
                    time_limit_minutes = table.Column<int>(type: "integer", nullable: true),
                    max_attempts = table.Column<int>(type: "integer", nullable: true),
                    published = table.Column<bool>(type: "boolean", nullable: true),
                    access_password = table.Column<string>(type: "text", nullable: true),
                    expires_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_quizzes", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "questions",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    quiz_id = table.Column<Guid>(type: "uuid", nullable: false),
                    page_id = table.Column<Guid>(type: "uuid", nullable: true),
                    condition_question_id = table.Column<Guid>(type: "uuid", nullable: true),
                    prompt = table.Column<string>(type: "text", nullable: false),
                    required = table.Column<bool>(type: "boolean", nullable: false),
                    position = table.Column<int>(type: "integer", nullable: false),
                    type = table.Column<string>(type: "character varying(21)", maxLength: 21, nullable: false),
                    total = table.Column<int>(type: "integer", nullable: true),
                    correct_option_id = table.Column<Guid>(type: "uuid", nullable: true),
                    template = table.Column<string>(type: "text", nullable: true),
                    image_url = table.Column<string>(type: "text", nullable: true),
                    correct_region_id = table.Column<Guid>(type: "uuid", nullable: true),
                    multiple = table.Column<bool>(type: "boolean", nullable: true),
                    min = table.Column<decimal>(type: "numeric", nullable: true),
                    max = table.Column<decimal>(type: "numeric", nullable: true),
                    rating_question_min = table.Column<int>(type: "integer", nullable: true),
                    rating_question_max = table.Column<int>(type: "integer", nullable: true),
                    single_choice_question_correct_option_id = table.Column<Guid>(type: "uuid", nullable: true),
                    slider_question_min = table.Column<int>(type: "integer", nullable: true),
                    slider_question_max = table.Column<int>(type: "integer", nullable: true),
                    step = table.Column<int>(type: "integer", nullable: true),
                    multiline = table.Column<bool>(type: "boolean", nullable: true),
                    max_length = table.Column<int>(type: "integer", nullable: true),
                    correct_answer = table.Column<bool>(type: "boolean", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_questions", x => x.id);
                    table.ForeignKey(
                        name: "fk_questions_quizzes_quiz_id",
                        column: x => x.quiz_id,
                        principalTable: "quizzes",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "quiz_attempts",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    quiz_id = table.Column<Guid>(type: "uuid", nullable: false),
                    respondent_name = table.Column<string>(type: "text", nullable: true),
                    respondent_client_id = table.Column<string>(type: "text", nullable: true),
                    started_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    completed_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    score = table.Column<int>(type: "integer", nullable: true),
                    snapshot_is_graded = table.Column<bool>(type: "boolean", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_quiz_attempts", x => x.id);
                    table.ForeignKey(
                        name: "fk_quiz_attempts_quizzes_quiz_id",
                        column: x => x.quiz_id,
                        principalTable: "quizzes",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "quiz_pages",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    quiz_id = table.Column<Guid>(type: "uuid", nullable: false),
                    title = table.Column<string>(type: "text", nullable: false),
                    position = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_quiz_pages", x => x.id);
                    table.ForeignKey(
                        name: "fk_quiz_pages_quizzes_quiz_id",
                        column: x => x.quiz_id,
                        principalTable: "quizzes",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "fill_blank_answers",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    question_id = table.Column<Guid>(type: "uuid", nullable: false),
                    position = table.Column<int>(type: "integer", nullable: false),
                    answer = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_fill_blank_answers", x => x.id);
                    table.ForeignKey(
                        name: "fk_fill_blank_answers_questions_question_id",
                        column: x => x.question_id,
                        principalTable: "questions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "hotspot_regions",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    question_id = table.Column<Guid>(type: "uuid", nullable: false),
                    x = table.Column<decimal>(type: "numeric", nullable: false),
                    y = table.Column<decimal>(type: "numeric", nullable: false),
                    width = table.Column<decimal>(type: "numeric", nullable: false),
                    height = table.Column<decimal>(type: "numeric", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_hotspot_regions", x => x.id);
                    table.ForeignKey(
                        name: "fk_hotspot_regions_questions_question_id",
                        column: x => x.question_id,
                        principalTable: "questions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "matching_pairs",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    question_id = table.Column<Guid>(type: "uuid", nullable: false),
                    left = table.Column<string>(type: "text", nullable: false),
                    right = table.Column<string>(type: "text", nullable: false),
                    position = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_matching_pairs", x => x.id);
                    table.ForeignKey(
                        name: "fk_matching_pairs_questions_question_id",
                        column: x => x.question_id,
                        principalTable: "questions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "question_options",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    question_id = table.Column<Guid>(type: "uuid", nullable: false),
                    kind = table.Column<int>(type: "integer", nullable: false),
                    label = table.Column<string>(type: "text", nullable: false),
                    image_url = table.Column<string>(type: "text", nullable: true),
                    is_correct = table.Column<bool>(type: "boolean", nullable: true),
                    position = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_question_options", x => x.id);
                    table.ForeignKey(
                        name: "fk_question_options_questions_question_id",
                        column: x => x.question_id,
                        principalTable: "questions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "attempt_question_snapshots",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    attempt_id = table.Column<Guid>(type: "uuid", nullable: false),
                    original_question_id = table.Column<Guid>(type: "uuid", nullable: false),
                    type = table.Column<string>(type: "text", nullable: false),
                    prompt = table.Column<string>(type: "text", nullable: false),
                    required = table.Column<bool>(type: "boolean", nullable: false),
                    position = table.Column<int>(type: "integer", nullable: false),
                    condition_question_id = table.Column<Guid>(type: "uuid", nullable: true),
                    multiline = table.Column<bool>(type: "boolean", nullable: true),
                    max_length = table.Column<int>(type: "integer", nullable: true),
                    multiple = table.Column<bool>(type: "boolean", nullable: true),
                    correct_answer = table.Column<bool>(type: "boolean", nullable: true),
                    correct_option_id = table.Column<Guid>(type: "uuid", nullable: true),
                    min = table.Column<decimal>(type: "numeric", nullable: true),
                    max = table.Column<decimal>(type: "numeric", nullable: true),
                    step = table.Column<int>(type: "integer", nullable: true),
                    total = table.Column<int>(type: "integer", nullable: true),
                    template = table.Column<string>(type: "text", nullable: true),
                    image_url = table.Column<string>(type: "text", nullable: true),
                    correct_region_id = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_attempt_question_snapshots", x => x.id);
                    table.ForeignKey(
                        name: "fk_attempt_question_snapshots_quiz_attempts_attempt_id",
                        column: x => x.attempt_id,
                        principalTable: "quiz_attempts",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "question_responses",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    attempt_id = table.Column<Guid>(type: "uuid", nullable: false),
                    question_id = table.Column<Guid>(type: "uuid", nullable: false),
                    text = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_question_responses", x => x.id);
                    table.ForeignKey(
                        name: "fk_question_responses_quiz_attempts_attempt_id",
                        column: x => x.attempt_id,
                        principalTable: "quiz_attempts",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "attempt_fill_blank_answer_snapshots",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    question_snapshot_id = table.Column<Guid>(type: "uuid", nullable: false),
                    position = table.Column<int>(type: "integer", nullable: false),
                    answer = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_attempt_fill_blank_answer_snapshots", x => x.id);
                    table.ForeignKey(
                        name: "fk_attempt_fill_blank_answer_snapshots_attempt_question_snapsh",
                        column: x => x.question_snapshot_id,
                        principalTable: "attempt_question_snapshots",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "attempt_hotspot_region_snapshots",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    question_snapshot_id = table.Column<Guid>(type: "uuid", nullable: false),
                    original_region_id = table.Column<Guid>(type: "uuid", nullable: false),
                    x = table.Column<decimal>(type: "numeric", nullable: false),
                    y = table.Column<decimal>(type: "numeric", nullable: false),
                    width = table.Column<decimal>(type: "numeric", nullable: false),
                    height = table.Column<decimal>(type: "numeric", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_attempt_hotspot_region_snapshots", x => x.id);
                    table.ForeignKey(
                        name: "fk_attempt_hotspot_region_snapshots_attempt_question_snapshots",
                        column: x => x.question_snapshot_id,
                        principalTable: "attempt_question_snapshots",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "attempt_matching_pair_snapshots",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    question_snapshot_id = table.Column<Guid>(type: "uuid", nullable: false),
                    original_pair_id = table.Column<Guid>(type: "uuid", nullable: false),
                    left = table.Column<string>(type: "text", nullable: false),
                    right = table.Column<string>(type: "text", nullable: false),
                    position = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_attempt_matching_pair_snapshots", x => x.id);
                    table.ForeignKey(
                        name: "fk_attempt_matching_pair_snapshots_attempt_question_snapshots_",
                        column: x => x.question_snapshot_id,
                        principalTable: "attempt_question_snapshots",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "attempt_option_snapshots",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    question_snapshot_id = table.Column<Guid>(type: "uuid", nullable: false),
                    original_option_id = table.Column<Guid>(type: "uuid", nullable: false),
                    kind = table.Column<int>(type: "integer", nullable: false),
                    label = table.Column<string>(type: "text", nullable: false),
                    image_url = table.Column<string>(type: "text", nullable: true),
                    is_correct = table.Column<bool>(type: "boolean", nullable: true),
                    position = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_attempt_option_snapshots", x => x.id);
                    table.ForeignKey(
                        name: "fk_attempt_option_snapshots_attempt_question_snapshots_questio",
                        column: x => x.question_snapshot_id,
                        principalTable: "attempt_question_snapshots",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "response_blanks",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    response_id = table.Column<Guid>(type: "uuid", nullable: false),
                    position = table.Column<int>(type: "integer", nullable: false),
                    answer = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_response_blanks", x => x.id);
                    table.ForeignKey(
                        name: "fk_response_blanks_question_responses_response_id",
                        column: x => x.response_id,
                        principalTable: "question_responses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "response_distributions",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    response_id = table.Column<Guid>(type: "uuid", nullable: false),
                    option_id = table.Column<Guid>(type: "uuid", nullable: false),
                    points = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_response_distributions", x => x.id);
                    table.ForeignKey(
                        name: "fk_response_distributions_question_responses_response_id",
                        column: x => x.response_id,
                        principalTable: "question_responses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "response_files",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    response_id = table.Column<Guid>(type: "uuid", nullable: false),
                    file_name = table.Column<string>(type: "text", nullable: false),
                    content_type = table.Column<string>(type: "text", nullable: false),
                    content = table.Column<byte[]>(type: "bytea", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_response_files", x => x.id);
                    table.ForeignKey(
                        name: "fk_response_files_question_responses_response_id",
                        column: x => x.response_id,
                        principalTable: "question_responses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "response_matches",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    response_id = table.Column<Guid>(type: "uuid", nullable: false),
                    key_id = table.Column<Guid>(type: "uuid", nullable: false),
                    value_id = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_response_matches", x => x.id);
                    table.ForeignKey(
                        name: "fk_response_matches_question_responses_response_id",
                        column: x => x.response_id,
                        principalTable: "question_responses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "response_selected_options",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    response_id = table.Column<Guid>(type: "uuid", nullable: false),
                    option_id = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_response_selected_options", x => x.id);
                    table.ForeignKey(
                        name: "fk_response_selected_options_question_responses_response_id",
                        column: x => x.response_id,
                        principalTable: "question_responses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_admin_users_username",
                table: "admin_users",
                column: "username",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_attempt_fill_blank_answer_snapshots_question_snapshot_id",
                table: "attempt_fill_blank_answer_snapshots",
                column: "question_snapshot_id");

            migrationBuilder.CreateIndex(
                name: "ix_attempt_hotspot_region_snapshots_question_snapshot_id",
                table: "attempt_hotspot_region_snapshots",
                column: "question_snapshot_id");

            migrationBuilder.CreateIndex(
                name: "ix_attempt_matching_pair_snapshots_question_snapshot_id",
                table: "attempt_matching_pair_snapshots",
                column: "question_snapshot_id");

            migrationBuilder.CreateIndex(
                name: "ix_attempt_option_snapshots_question_snapshot_id",
                table: "attempt_option_snapshots",
                column: "question_snapshot_id");

            migrationBuilder.CreateIndex(
                name: "ix_attempt_question_snapshots_attempt_id",
                table: "attempt_question_snapshots",
                column: "attempt_id");

            migrationBuilder.CreateIndex(
                name: "ix_fill_blank_answers_question_id",
                table: "fill_blank_answers",
                column: "question_id");

            migrationBuilder.CreateIndex(
                name: "ix_hotspot_regions_question_id",
                table: "hotspot_regions",
                column: "question_id");

            migrationBuilder.CreateIndex(
                name: "ix_matching_pairs_question_id",
                table: "matching_pairs",
                column: "question_id");

            migrationBuilder.CreateIndex(
                name: "ix_question_options_question_id",
                table: "question_options",
                column: "question_id");

            migrationBuilder.CreateIndex(
                name: "ix_question_responses_attempt_id",
                table: "question_responses",
                column: "attempt_id");

            migrationBuilder.CreateIndex(
                name: "ix_questions_quiz_id",
                table: "questions",
                column: "quiz_id");

            migrationBuilder.CreateIndex(
                name: "ix_quiz_attempts_quiz_id",
                table: "quiz_attempts",
                column: "quiz_id");

            migrationBuilder.CreateIndex(
                name: "ix_quiz_pages_quiz_id",
                table: "quiz_pages",
                column: "quiz_id");

            migrationBuilder.CreateIndex(
                name: "ix_response_blanks_response_id",
                table: "response_blanks",
                column: "response_id");

            migrationBuilder.CreateIndex(
                name: "ix_response_distributions_response_id",
                table: "response_distributions",
                column: "response_id");

            migrationBuilder.CreateIndex(
                name: "ix_response_files_response_id",
                table: "response_files",
                column: "response_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_response_matches_response_id",
                table: "response_matches",
                column: "response_id");

            migrationBuilder.CreateIndex(
                name: "ix_response_selected_options_response_id",
                table: "response_selected_options",
                column: "response_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "admin_users");

            migrationBuilder.DropTable(
                name: "attempt_fill_blank_answer_snapshots");

            migrationBuilder.DropTable(
                name: "attempt_hotspot_region_snapshots");

            migrationBuilder.DropTable(
                name: "attempt_matching_pair_snapshots");

            migrationBuilder.DropTable(
                name: "attempt_option_snapshots");

            migrationBuilder.DropTable(
                name: "fill_blank_answers");

            migrationBuilder.DropTable(
                name: "hotspot_regions");

            migrationBuilder.DropTable(
                name: "matching_pairs");

            migrationBuilder.DropTable(
                name: "question_options");

            migrationBuilder.DropTable(
                name: "quiz_pages");

            migrationBuilder.DropTable(
                name: "response_blanks");

            migrationBuilder.DropTable(
                name: "response_distributions");

            migrationBuilder.DropTable(
                name: "response_files");

            migrationBuilder.DropTable(
                name: "response_matches");

            migrationBuilder.DropTable(
                name: "response_selected_options");

            migrationBuilder.DropTable(
                name: "attempt_question_snapshots");

            migrationBuilder.DropTable(
                name: "questions");

            migrationBuilder.DropTable(
                name: "question_responses");

            migrationBuilder.DropTable(
                name: "quiz_attempts");

            migrationBuilder.DropTable(
                name: "quizzes");
        }
    }
}
