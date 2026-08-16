<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;

class PurityCalculationTest extends TestCase
{
    public function test_fine_gold_weight_calculation()
    {
        // 10 grams of 22K (91.60%) gold = 9.16 grams fine gold
        $grossWeight = 10.00;
        $purityPercentage = 91.60;
        $fineWeight = round(($grossWeight * $purityPercentage) / 100, 3);

        $this->assertEquals(9.16, $fineWeight);
    }

    public function test_fine_silver_weight_calculation()
    {
        // 50 grams of 925 Sterling Silver (92.50%) = 46.25 grams fine silver
        $grossWeight = 50.00;
        $purityPercentage = 92.50;
        $fineWeight = round(($grossWeight * $purityPercentage) / 100, 3);

        $this->assertEquals(46.25, $fineWeight);
    }

    public function test_total_metal_value_calculation()
    {
        // 15.5 grams at BDT 11,500.00 per gram = BDT 178,250.00
        $netWeight = 15.50;
        $pricePerGram = 11500.00;
        $totalPrice = round($netWeight * $pricePerGram, 2);

        $this->assertEquals(178250.00, $totalPrice);
    }
}
