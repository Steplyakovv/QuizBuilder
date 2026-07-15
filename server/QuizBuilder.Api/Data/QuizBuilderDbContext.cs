using Microsoft.EntityFrameworkCore;
using QuizBuilder.Api.Models;

namespace QuizBuilder.Api.Data;

public class QuizBuilderDbContext(DbContextOptions<QuizBuilderDbContext> options) : DbContext(options)
{
    public DbSet<AdminUser> AdminUsers => Set<AdminUser>();
    public DbSet<NotificationSettings> NotificationSettings => Set<NotificationSettings>();

    public DbSet<Quiz> Quizzes => Set<Quiz>();
    public DbSet<QuizPage> QuizPages => Set<QuizPage>();
    public DbSet<Question> Questions => Set<Question>();
    public DbSet<QuestionOption> QuestionOptions => Set<QuestionOption>();
    public DbSet<MatchingPair> MatchingPairs => Set<MatchingPair>();
    public DbSet<HotspotRegion> HotspotRegions => Set<HotspotRegion>();
    public DbSet<FillBlankAnswer> FillBlankAnswers => Set<FillBlankAnswer>();

    public DbSet<QuizAttempt> QuizAttempts => Set<QuizAttempt>();
    public DbSet<QuestionResponse> QuestionResponses => Set<QuestionResponse>();
    public DbSet<ResponseSelectedOption> ResponseSelectedOptions => Set<ResponseSelectedOption>();
    public DbSet<ResponseDistribution> ResponseDistributions => Set<ResponseDistribution>();
    public DbSet<ResponseBlank> ResponseBlanks => Set<ResponseBlank>();
    public DbSet<ResponseMatch> ResponseMatches => Set<ResponseMatch>();
    public DbSet<ResponseFile> ResponseFiles => Set<ResponseFile>();

    public DbSet<AttemptQuestionSnapshot> AttemptQuestionSnapshots => Set<AttemptQuestionSnapshot>();
    public DbSet<AttemptOptionSnapshot> AttemptOptionSnapshots => Set<AttemptOptionSnapshot>();
    public DbSet<AttemptMatchingPairSnapshot> AttemptMatchingPairSnapshots => Set<AttemptMatchingPairSnapshot>();
    public DbSet<AttemptHotspotRegionSnapshot> AttemptHotspotRegionSnapshots => Set<AttemptHotspotRegionSnapshot>();
    public DbSet<AttemptFillBlankAnswerSnapshot> AttemptFillBlankAnswerSnapshots => Set<AttemptFillBlankAnswerSnapshot>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<AdminUser>(entity =>
        {
            entity.HasIndex(u => u.Username).IsUnique();
        });

        ConfigureQuizzes(modelBuilder);
        ConfigureQuestions(modelBuilder);
        ConfigureAttempts(modelBuilder);
        ConfigureSnapshots(modelBuilder);
    }

    private static void ConfigureQuizzes(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Quiz>(entity =>
        {
            entity.HasMany(q => q.Pages)
                .WithOne(p => p.Quiz)
                .HasForeignKey(p => p.QuizId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(q => q.Questions)
                .WithOne(q => q.Quiz)
                .HasForeignKey(q => q.QuizId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(q => q.Attempts)
                .WithOne(a => a.Quiz)
                .HasForeignKey(a => a.QuizId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }

    private static void ConfigureQuestions(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Question>(entity =>
        {
            entity.HasDiscriminator<string>("Type")
                .HasValue<SingleChoiceQuestion>("single-choice")
                .HasValue<MultipleChoiceQuestion>("multiple-choice")
                .HasValue<TextQuestion>("text")
                .HasValue<ImageChoiceQuestion>("image-choice")
                .HasValue<ImageGridQuestion>("image-grid")
                .HasValue<TrueFalseQuestion>("true-false")
                .HasValue<DropdownQuestion>("dropdown")
                .HasValue<NumberQuestion>("number")
                .HasValue<DateQuestion>("date")
                .HasValue<RatingQuestion>("rating")
                .HasValue<SliderQuestion>("slider")
                .HasValue<ConstantSumQuestion>("constant-sum")
                .HasValue<WordChoiceQuestion>("word-choice")
                .HasValue<FillInTheBlankQuestion>("fill-in-the-blank")
                .HasValue<RankingQuestion>("ranking")
                .HasValue<MatchingQuestion>("matching")
                .HasValue<MatrixQuestion>("matrix")
                .HasValue<HotspotQuestion>("hotspot")
                .HasValue<FileUploadQuestion>("file-upload");

            entity.HasMany(q => q.Options)
                .WithOne(o => o.Question)
                .HasForeignKey(o => o.QuestionId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<FillInTheBlankQuestion>()
            .HasMany(q => q.Answers)
            .WithOne(a => a.Question)
            .HasForeignKey(a => a.QuestionId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<MatchingQuestion>()
            .HasMany(q => q.Pairs)
            .WithOne(p => p.Question)
            .HasForeignKey(p => p.QuestionId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<HotspotQuestion>()
            .HasMany(q => q.Regions)
            .WithOne(r => r.Question)
            .HasForeignKey(r => r.QuestionId)
            .OnDelete(DeleteBehavior.Cascade);

        // SingleChoiceQuestion.CorrectOptionId, DropdownQuestion.CorrectOptionId and
        // HotspotQuestion.CorrectRegionId, Question.ConditionQuestionId are plain Guid
        // columns (no FK constraint) for the same reason as above.
    }

    private static void ConfigureAttempts(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<QuizAttempt>(entity =>
        {
            entity.HasMany(a => a.Responses)
                .WithOne(r => r.Attempt)
                .HasForeignKey(r => r.AttemptId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(a => a.QuestionSnapshots)
                .WithOne(s => s.Attempt)
                .HasForeignKey(s => s.AttemptId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<QuestionResponse>(entity =>
        {
            entity.HasMany(r => r.SelectedOptions)
                .WithOne(o => o.Response)
                .HasForeignKey(o => o.ResponseId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(r => r.Distributions)
                .WithOne(d => d.Response)
                .HasForeignKey(d => d.ResponseId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(r => r.Blanks)
                .WithOne(b => b.Response)
                .HasForeignKey(b => b.ResponseId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(r => r.Matches)
                .WithOne(m => m.Response)
                .HasForeignKey(m => m.ResponseId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(r => r.File)
                .WithOne(f => f.Response)
                .HasForeignKey<ResponseFile>(f => f.ResponseId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }

    private static void ConfigureSnapshots(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<AttemptQuestionSnapshot>(entity =>
        {
            entity.HasMany(s => s.Options)
                .WithOne(o => o.QuestionSnapshot)
                .HasForeignKey(o => o.QuestionSnapshotId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(s => s.Pairs)
                .WithOne(p => p.QuestionSnapshot)
                .HasForeignKey(p => p.QuestionSnapshotId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(s => s.Regions)
                .WithOne(r => r.QuestionSnapshot)
                .HasForeignKey(r => r.QuestionSnapshotId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(s => s.Answers)
                .WithOne(a => a.QuestionSnapshot)
                .HasForeignKey(a => a.QuestionSnapshotId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
