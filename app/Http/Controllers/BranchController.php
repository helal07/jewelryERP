<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Http\Requests\StoreBranchRequest;
use App\Http\Requests\UpdateBranchRequest;
use App\Services\BranchService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class BranchController extends Controller
{
    public function __construct(private BranchService $branchService)
    {
    }

    public function index(Request $request)
    {
        Gate::authorize('viewAny', Branch::class);
        $branches = Branch::latest()->paginate(10);
        $isMainBranch = $request->user()->isMainBranch();

        return Inertia::render('Branches/Index', [
            'branches' => $branches,
            'is_main_branch' => $isMainBranch,
        ]);
    }

    public function create(Request $request)
    {
        Gate::authorize('create', Branch::class);

        if (!$request->user()->isMainBranch()) {
            return redirect()->route('branches.index')->with('error', 'Only the Main Branch (Head Office) is authorized to add branches.');
        }

        return Inertia::render('Branches/Create');
    }

    public function store(StoreBranchRequest $request)
    {
        Gate::authorize('create', Branch::class);

        if (!$request->user()->isMainBranch()) {
            return redirect()->route('branches.index')->with('error', 'Only the Main Branch (Head Office) is authorized to add branches.');
        }

        $this->branchService->createBranch($request->validated());
        return redirect()->route('branches.index')->with('success', 'Branch created successfully.');
    }

    public function edit(Request $request, Branch $branch)
    {
        Gate::authorize('update', $branch);

        if (!$request->user()->isMainBranch()) {
            return redirect()->route('branches.index')->with('error', 'Only the Main Branch (Head Office) is authorized to edit branches.');
        }

        return Inertia::render('Branches/Edit', [
            'branch' => $branch
        ]);
    }

    public function update(UpdateBranchRequest $request, Branch $branch)
    {
        Gate::authorize('update', $branch);

        if (!$request->user()->isMainBranch()) {
            return redirect()->route('branches.index')->with('error', 'Only the Main Branch (Head Office) is authorized to update branches.');
        }

        $this->branchService->updateBranch($branch, $request->validated());
        return redirect()->route('branches.index')->with('success', 'Branch updated successfully.');
    }

    public function destroy(Request $request, Branch $branch)
    {
        Gate::authorize('delete', $branch);

        if (!$request->user()->isMainBranch()) {
            return redirect()->route('branches.index')->with('error', 'Only the Main Branch (Head Office) is authorized to delete branches.');
        }

        $this->branchService->deleteBranch($branch);
        return redirect()->route('branches.index')->with('success', 'Branch deleted successfully.');
    }
}
