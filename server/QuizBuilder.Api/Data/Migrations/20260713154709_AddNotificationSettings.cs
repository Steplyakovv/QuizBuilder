using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QuizBuilder.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddNotificationSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "notification_settings",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    smtp_host = table.Column<string>(type: "text", nullable: true),
                    smtp_port = table.Column<int>(type: "integer", nullable: false),
                    smtp_username = table.Column<string>(type: "text", nullable: true),
                    smtp_password = table.Column<string>(type: "text", nullable: true),
                    smtp_from = table.Column<string>(type: "text", nullable: true),
                    smtp_use_start_tls = table.Column<bool>(type: "boolean", nullable: false),
                    report_recipient_email = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_notification_settings", x => x.id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "notification_settings");
        }
    }
}
