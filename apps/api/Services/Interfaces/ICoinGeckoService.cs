namespace CryptoPulse.API.Services.Interfaces;

public interface ICoinGeckoService
{
    Task<string> GetPingAsync();
}