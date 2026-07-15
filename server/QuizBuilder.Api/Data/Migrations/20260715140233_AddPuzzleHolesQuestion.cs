using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QuizBuilder.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddPuzzleHolesQuestion : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "hole_count",
                table: "questions",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "hole_count",
                table: "attempt_question_snapshots",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "response_puzzle_hole_placements",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    response_id = table.Column<Guid>(type: "uuid", nullable: false),
                    piece_index = table.Column<int>(type: "integer", nullable: false),
                    cell_index = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_response_puzzle_hole_placements", x => x.id);
                    table.ForeignKey(
                        name: "fk_response_puzzle_hole_placements_question_responses_response",
                        column: x => x.response_id,
                        principalTable: "question_responses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_response_puzzle_hole_placements_response_id",
                table: "response_puzzle_hole_placements",
                column: "response_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "response_puzzle_hole_placements");

            migrationBuilder.DropColumn(
                name: "hole_count",
                table: "questions");

            migrationBuilder.DropColumn(
                name: "hole_count",
                table: "attempt_question_snapshots");
        }
    }
}
