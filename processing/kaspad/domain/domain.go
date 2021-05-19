package domain

import (
	consensusPackage "github.com/kaspa-live/kaspa-graph-inspector/processing/kaspad/domain/consensus"
	"github.com/kaspa-live/kaspa-graph-inspector/processing/kaspad/domain/mining_manager"
	"github.com/kaspanet/kaspad/domain/consensus/model"
	"github.com/kaspanet/kaspad/domain/consensus/model/externalapi"
	"github.com/kaspanet/kaspad/domain/dagconfig"
	"github.com/kaspanet/kaspad/domain/miningmanager"
	"github.com/kaspanet/kaspad/infrastructure/db/database"
)

func New(dagParams *dagconfig.Params, databaseContext database.Database) (*Domain, error) {
	consensus, err := consensusPackage.New(dagParams, databaseContext)
	if err != nil {
		return nil, err
	}
	miningManager := mining_manager.New()
	return &Domain{
		consensus:     consensus,
		miningManager: miningManager,
	}, nil
}

type Domain struct {
	consensus     *consensusPackage.Consensus
	miningManager miningmanager.MiningManager
}

func (d *Domain) SetOnAddingBlockListener(listener consensusPackage.OnAddingBlockListener) {
	d.consensus.SetOnAddingBlockListener(listener)
}

func (d *Domain) SetOnBlockAddedListener(listener consensusPackage.OnBlockAddedListener) {
	d.consensus.SetOnBlockAddedListener(listener)
}

func (d *Domain) BlockGHOSTDAGData(blockHash *externalapi.DomainHash) (*model.BlockGHOSTDAGData, error) {
	return d.consensus.BlockGHOSTDAGData(blockHash)
}

func (d *Domain) MiningManager() miningmanager.MiningManager {
	return d.miningManager
}

func (d *Domain) Consensus() externalapi.Consensus {
	return d.consensus
}
