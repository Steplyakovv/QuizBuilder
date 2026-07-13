using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QuizBuilder.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddQuizWebhookUrl : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "webhook_url",
                table: "quizzes",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "webhook_url",
                table: "quizzes");
        }
    }
}
