<?php

namespace Wame\LaravelTelescopeDashboard\Http\Middleware;

use Closure;
use Laravel\Telescope\Telescope;

class AuthorizeDashboard
{
    public function handle($request, Closure $next)
    {
        return Telescope::check($request) ? $next($request) : abort(403);
    }
}
