using Microsoft.AspNetCore.Mvc;
using CryptoPulse.API.Services.Interfaces;
[ApiController]
[Route("api/[controller]")]
public class TestCoinGeckoController : ControllerBase
{
    private readonly ICoinGeckoService _service;

    public TestCoinGeckoController(ICoinGeckoService service)
    {
        _service = service;
    }

    [HttpGet("ping")]
    public async Task<IActionResult> Ping()
    {
        var result = await _service.GetPingAsync();
        return Ok(result);
    }
}