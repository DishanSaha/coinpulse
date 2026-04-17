namespace CryptoPulse.API.Services;

using CryptoPulse.API.Services.Interfaces;

public class CoinGeckoService : ICoinGeckoService
{
    private readonly HttpClient _http;

    public CoinGeckoService(HttpClient http)
    {
        _http = http;
    }

    public async Task<string> GetPingAsync()
    {
        var response = await _http.GetAsync("ping");
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadAsStringAsync();
    }
}