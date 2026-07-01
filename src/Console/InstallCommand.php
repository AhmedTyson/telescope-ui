<?php

namespace Wame\LaravelTelescopeDashboard\Console;

use Illuminate\Console\Command;

class InstallCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'telescope-dashboard:install';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Install all of the Telescope Dashboard resources';

    /**
     * Execute the console command.
     *
     * @return void
     */
    public function handle()
    {
        $this->comment('Publishing Telescope Dashboard Configuration...');
        $this->callSilent('vendor:publish', ['--tag' => 'telescope-dashboard-config']);

        $this->comment('Publishing Telescope Dashboard Assets...');
        $this->callSilent('vendor:publish', ['--tag' => 'telescope-dashboard-assets']);

        $this->comment('Installing Telescope...');
        $this->call('telescope:install');

        $this->comment('Running Migrations...');
        $this->call('migrate');

        $this->info('Telescope Dashboard scaffolding installed successfully.');
    }
}
