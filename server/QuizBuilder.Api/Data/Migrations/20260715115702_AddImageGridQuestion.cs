using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QuizBuilder.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddImageGridQuestion : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "columns",
                table: "questions",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "columns",
                table: "attempt_question_snapshots",
                type: "integer",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "columns",
                table: "questions");

            migrationBuilder.DropColumn(
                name: "columns",
                table: "attempt_question_snapshots");
        }
    }
}
