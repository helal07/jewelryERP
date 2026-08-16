<?php

namespace Tests\Unit;

use App\Services\ProductService;
use PHPUnit\Framework\TestCase;

class ProductServiceTest extends TestCase
{
    protected ProductService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new ProductService();
    }

    public function test_compute_net_weight(): void
    {
        // 10.5 - 0.5 = 10.0
        $this->assertEquals(10.0, $this->service->computeNetWeight(10.5, 0.5));
        
        // 15.123 - 2.1 = 13.023
        $this->assertEquals(13.023, $this->service->computeNetWeight(15.123, 2.1));
        
        // No stone weight
        $this->assertEquals(5.5, $this->service->computeNetWeight(5.5, 0));
        
        // Negative result should still just compute (validation handles positive check)
        $this->assertEquals(-1.0, $this->service->computeNetWeight(5.0, 6.0));
    }
}
