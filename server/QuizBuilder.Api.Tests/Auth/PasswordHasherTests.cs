using QuizBuilder.Api.Auth;

namespace QuizBuilder.Api.Tests.Auth;

public class PasswordHasherTests
{
    [Fact]
    public void Verify_returns_true_for_the_correct_password()
    {
        var hashed = PasswordHasher.Hash("correct horse battery staple");

        Assert.True(PasswordHasher.Verify("correct horse battery staple", hashed));
    }

    [Fact]
    public void Verify_returns_false_for_the_wrong_password()
    {
        var hashed = PasswordHasher.Hash("correct horse battery staple");

        Assert.False(PasswordHasher.Verify("wrong password", hashed));
    }

    [Fact]
    public void Hash_salts_so_the_same_password_hashes_differently_each_time()
    {
        var first = PasswordHasher.Hash("admin");
        var second = PasswordHasher.Hash("admin");

        Assert.NotEqual(first, second);
        Assert.True(PasswordHasher.Verify("admin", first));
        Assert.True(PasswordHasher.Verify("admin", second));
    }

    [Theory]
    [InlineData("")]
    [InlineData("not-a-valid-hash")]
    [InlineData("210000.onlyTwoParts")]
    public void Verify_returns_false_for_a_malformed_hash(string malformed)
    {
        Assert.False(PasswordHasher.Verify("admin", malformed));
    }
}
